const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Buyable", function () {
  beforeEach(async function() {
    const [owner, otherAccount] = await ethers.getSigners();
    this.owner = owner;
    this.otherAccount = otherAccount;

    this.BuyMe = await ethers.getContractFactory("BuyMe");
    this.bm = await this.BuyMe.deploy();


  });

  describe("onlyOwner protection", function () {
    it('protects write function', async function () {
      await expect(this.bm.connect(this.otherAccount)['write(string)']('security test')).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects erase function', async function () {
      await this.bm.connect(this.owner)['write(string)']('owner was here');
      await expect(this.bm.connect(this.otherAccount)['erase(uint256)'](0)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects the changeData function', async function () {
      await this.bm.connect(this.owner)['write(string)']('owner was here');
      await expect(this.bm.connect(this.otherAccount)['changeData(uint256,string)'](0, 'changed by otherAccount')).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects transferOwnership function', async function () {
      await expect(this.bm.connect(this.otherAccount)['transferOwnership(address)'](this.otherAccount.address)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects the sellContract function', async function () {
      await expect(this.bm.connect(this.otherAccount)['sellContract(uint256)']('1000000000000')).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects the endSale function', async function () {
      await expect(this.bm.connect(this.otherAccount)['endSale()']()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects the renounceOwnership function', async function () {
      await expect(this.bm.connect(this.otherAccount)['renounceOwnership()']()).to.be.revertedWith("Ownable: caller is not the owner");
    });

  });

  describe("originalOwner protection", function () {
    it('protects the setFee function', async function () {
      await expect(this.bm.connect(this.otherAccount)['setFee(uint256)']('0')).to.be.revertedWith("Buyable: Caller is not original owner");
    });
  });

  describe("intended functionality", function () {
    it('owner can call write function', async function () {
      await this.bm.connect(this.owner)['write(string)']('owner is testing');
      const testString = await this.bm.data(0);
      expect(testString).to.equal('owner is testing');
    });

    it('owner can call sellContract', async function () {
      expect(await this.bm.connect(this.owner)['sellContract(uint256)']('1000000000000000000')).to.emit('listed');
    });

    it('buyer cannot buy for incorrect price', async function () {
      await this.bm.connect(this.owner)['sellContract(uint256)']('1000000000000000000');
      await expect(this.bm.connect(this.otherAccount)['buyContract()']({value: '1000'})).to.be.revertedWith("Buyable: invalid amount sent");
    });

    it('owner cannot list for under 100 Wei', async function () {
      await expect(this.bm.connect(this.owner)['sellContract(uint256)']('50')).to.be.revertedWith("Buyable: Proposed price must be higher than 100 Wei");
    });

    it('buyer can buy for correct price', async function () {
      await this.bm.connect(this.owner)['sellContract(uint256)']('1000000000000000000');
      expect(await this.bm.connect(this.otherAccount)['buyContract()']({value: '1000000000000000000'})).to.emit('bought');
    });

    it('transfers ownership to buyer', async function () {
      await this.bm.connect(this.owner)['sellContract(uint256)']('1000000000000000000');
      await this.bm.connect(this.otherAccount)['buyContract()']({value: '1000000000000000000'});
      expect(await this.bm.owner()).to.equal(this.otherAccount.address);
    });
  });

  describe("after contract purchase", function () {
    this.beforeEach(async function () {
      await this.bm.connect(this.owner)['sellContract(uint256)']('1000000000000000000');
      await this.bm.connect(this.otherAccount)['buyContract()']({value: '1000000000000000000'});
    });

    it('protects write from old owner', async function () {
      await expect(this.bm.connect(this.owner)['write(string)']('security test')).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects erase from old owner', async function () {
      await expect(this.bm.connect(this.owner)['erase(uint256)'](0)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects changeData from old owner', async function () {
      await expect(this.bm.connect(this.owner)['changeData(uint256,string)'](0,'old owner was here')).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects transferOwnership from old owner', async function () {
      await expect(this.bm.connect(this.owner)['transferOwnership(address)'](this.otherAccount.address)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects the sellContract from old owner', async function () {
      await expect(this.bm.connect(this.owner)['sellContract(uint256)']('1000000000000')).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects the endSale from old owner', async function () {
      await expect(this.bm.connect(this.owner)['endSale()']()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('protects the renounceOwnership from old owner', async function () {
      await expect(this.bm.connect(this.owner)['renounceOwnership()']()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('new owner can call write function', async function () {
      await this.bm.connect(this.otherAccount)['write(string)']('owner is testing');
      const testString = await this.bm.data(0);
      expect(testString).to.equal('owner is testing');
    });

    it('new owner can call sellContract', async function () {
      expect(await this.bm.connect(this.otherAccount)['sellContract(uint256)']('1000000000000000000')).to.emit('listed');
    });
    
  });

});
