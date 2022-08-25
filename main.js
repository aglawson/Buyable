

const provider = new ethers.providers.Web3Provider(window.ethereum)
let signer;

init = async function () {
    hide('buy');
    hide('sell');
    hide('price');
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner()
    if(await signer.provider._network.name != 'goerli') {
        alert('Must be on goerli testnet');
        throw('Must be on goerli testnet');
    }

    document.getElementById('connect').innerHTML = 'Connected!';

}

init();

getEvents = async function () {

    if(await signer.provider._network.name != 'goerli') {
        alert('Must be on goerli testnet');
        throw('Must be on goerli testnet');
    }

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
    if(await signer.provider._network.name != 'goerli') {
        alert('Must be on goerli testnet');
        throw('Must be on goerli testnet');
    }

    const address = document.getElementById('contractAddress').value;
    const contract = new ethers.Contract(address, abi, provider);
    const contractSigner = contract.connect(signer);

    const  price = await contract.priceOfContract();
    const log = await contractSigner.buyContract({value: price});
}

sell = async function () {
    if(await signer.provider._network.name != 'goerli') {
        alert('Must be on goerli testnet');
        throw('Must be on goerli testnet');
    }

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

// Force page refreshes on network changes
{
    // The "any" network will allow spontaneous network changes
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        if (oldNetwork) {
            window.location.reload();
        }
    });
}

