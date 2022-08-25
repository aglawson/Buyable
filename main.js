
const provider = new ethers.providers.Web3Provider(window.ethereum)
let signer;
init = async function () {
    hide('buy');
    hide('sell');
    hide('price');
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner()

    document.getElementById('connect').innerHTML = 'Connected!';



}

init();

getEvents = async function () {
    const address = document.getElementById('contractAddress').value;
    const contract = new ethers.Contract(address, abi, provider);
    buyable = 'string hello hi';

    hide('buy');
    hide('sell');
    hide('price');

    try{
        buyable = await contract.isBuyable();
    } catch {

    }
    if(typeof(buyable) != 'boolean') {
        document.getElementById('output').innerHTML = 'error: contract is not using Buyable.sol';
    }    

    let price;
    if(buyable) {
        if(await signer.getAddress() == await contract.owner()) {
            hide('buy');
        } else {
            unhide('buy');
        }
        document.getElementById('buy').innerHTML
        price = await contract.priceOfContract();
        document.getElementById('output').innerHTML = 'For Sale: ' + buyable + '<br/>Price: ' + price / 10**18 + ' Ether<br/>Owner: ' + await contract.owner();
        let network = signer.provider._network.name + '.';
        if(network == 'mainnet.') {
            network = ''
        }
        document.getElementById('output2').innerHTML = `Always research before buying: <a href="https://${network}etherscan.io/address/${address}" target="blank">Etherscan</a>`;

    } else {
        document.getElementById('output').innerHTML = buyable;
        if(await signer.getAddress() == await contract.owner()) {
            hide('buy');
            unhide('price');
            unhide('sell');
        }
    }

}

buy = async function () {
    const address = document.getElementById('contractAddress').value;
    const contract = new ethers.Contract(address, abi, provider);
    const contractSigner = contract.connect(signer);

    const  price = await contract.priceOfContract();
    const log = await contractSigner.buyContract({value: price});
}

sell = async function () {
    const address = document.getElementById('contractAddress').value;
    const contract = new ethers.Contract(address, abi, provider);
    const contractSigner = contract.connect(signer);

    let price = parseFloat(document.getElementById('price').value);
    price = price * 10**18;
    const log = await contractSigner.sellContract(price.toString());
}

function hide(element)  {  
    document.getElementById(element).style.visibility="hidden";  
}

function unhide(element) {
    document.getElementById(element).style.visibility="visible";  
}

