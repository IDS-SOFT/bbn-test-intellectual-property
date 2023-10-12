const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('IPLicensing', function () {
  let IPLicensing:any;
  let ipLicensing:any;
  let owner:any;
  let licensee:any;
  let random:any;

  const ipName = 'Example IP';
  const ipDescription = 'A sample IP description';
  const royaltyPercentage = 10; // 10% royalty

  beforeEach(async function () {
    [owner, licensee, random] = await ethers.getSigners();

    // Deploy the IPLicensing contract
    IPLicensing = await ethers.getContractFactory('IPLicensing');
    ipLicensing = await IPLicensing.deploy(ipName, ipDescription, licensee.address, royaltyPercentage);

    // Wait for the contract to be mined
    await ipLicensing.deployed();
  });

  it('should have the correct initial values', async function () {
    expect(await ipLicensing.ipName()).to.equal(ipName);
    expect(await ipLicensing.ipDescription()).to.equal(ipDescription);
    expect(await ipLicensing.licensee()).to.equal(licensee.address);
    expect(await ipLicensing.royaltyPercentage()).to.equal(royaltyPercentage);
    expect(await ipLicensing.isRevoked()).to.equal(false);
  });

  it('should grant usage rights and record usage', async function () {
    const usageAmount = ethers.utils.parseEther('1.0'); // 1 Ether

    // Licensee grants usage and sends Ether
    const initialBalanceLicensee = await licensee.getBalance();
    const initialBalanceOwner = await owner.getBalance();
    await ipLicensing.connect(licensee).grantUsage({ value: usageAmount });

    // Check balances and royalties
    const finalBalanceLicensee = await licensee.getBalance();
    const finalBalanceOwner = await owner.getBalance();
    const royalties = (usageAmount * royaltyPercentage) / 100;

    expect(finalBalanceLicensee).to.equal(initialBalanceLicensee.sub(usageAmount));
    expect(finalBalanceOwner).to.equal(initialBalanceOwner.add(royalties));
  });

  it('should not grant usage if the license is revoked', async function () {
    await ipLicensing.connect(owner).revokeLicense();

    const usageAmount = ethers.utils.parseEther('1.0'); // 1 Ether

    await expect(ipLicensing.connect(licensee).grantUsage({ value: usageAmount })).to.be.revertedWith('IP license is revoked');
  });

  it('should not grant usage to unauthorized address', async function () {
    const usageAmount = ethers.utils.parseEther('1.0'); // 1 Ether

    await expect(ipLicensing.connect(random).grantUsage({ value: usageAmount })).to.be.revertedWith('Only licensee can use the IP');
  });

  it('should revoke the license', async function () {
    await ipLicensing.connect(owner).revokeLicense();
    const isRevoked = await ipLicensing.isRevoked();

    expect(isRevoked).to.equal(true);
  });

  it('should withdraw royalties earned by the IP owner', async function () {
    const usageAmount = ethers.utils.parseEther('1.0'); // 1 Ether

    // Licensee grants usage and sends Ether
    await ipLicensing.connect(licensee).grantUsage({ value: usageAmount });

    // IP owner withdraws royalties
    const initialBalanceOwner = await owner.getBalance();
    
    await ipLicensing.connect(owner).withdrawRoyalties();
    const finalBalanceOwner = await owner.getBalance();
    

    // Calculate royalties
    const royalties = (usageAmount * royaltyPercentage) / 100;

    // Check that the IP owner's balance increased by the royalties
    expect(finalBalanceOwner).to.equal(initialBalanceOwner.add(royalties));
  });

  it('should not withdraw royalties if the license is revoked', async function () {
    await ipLicensing.connect(owner).revokeLicense();

    await expect(ipLicensing.connect(owner).withdrawRoyalties()).to.be.revertedWith('IP license is revoked');
  });
});
