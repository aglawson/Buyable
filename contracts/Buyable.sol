// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/Ownable.sol)

pragma solidity ^0.8.0;

import "./Context.sol";
import "./Ownable.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Buyable is Ownable {
    address private _originalOwner;

    bool public isForSale;

    uint256 public priceOfContract;
    uint256 public FEE_PCT;

    /**
     * @dev Initializes the contract setting the deployer as the original owner.
     */
    constructor() {
        _originalOwner = _msgSender();
    }

    modifier originalOwner {
        require(_originalOwner == _msgSender(), "Buyable: Caller is not original owner");
        _;
    }

    /**
     * @dev Makes ownership of contract purchasable 
     * price is in Wei => 1 * 10^-18 ETH
     */
    function sellContract(uint256 _priceOfContract) public onlyOwner {
        require(_priceOfContract >= 1000000000000, "Buyable: Proposed price is too low");
        isForSale = true;
        priceOfContract = _priceOfContract;
    }

    function endSale() public onlyOwner {
        isForSale = false;
    }

    function buyContract() public payable {
        require(isForSale, "Buyable: Contract not for sale");
        require(msg.value == priceOfContract, "Buyable: invalid amount sent");

        isForSale = false;
        priceOfContract = 0;

        uint256 fee = (msg.value / 100) * FEE_PCT;

        (bool success,) = owner().call{value: msg.value - fee}("");
        require(success, 'Transfer fail');

        (bool success2,) = _originalOwner.call{value: fee}("");
        require(success2, 'Transfer fail');

        _transferOwnership(_msgSender());
    }

    function setFee(uint256 _feepct) public originalOwner {
        require(_feepct <= 10, "Buyable: Fee percentage exceeds upper limit");
        FEE_PCT = _feepct;
    }
}
