const MetaCoin = artifacts.require("MetaCoin");

contract('MetaCoin', (accounts) => {
  it('should put 10000 MetaCoin in the first account', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const balance = await metaCoinInstance.getBalance.call(accounts[0]);

    assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
  });
  it('should call a function that depends on a linked library', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const metaCoinBalance = (await metaCoinInstance.getBalance.call(accounts[0])).toNumber();
    const metaCoinEthBalance = (await metaCoinInstance.getBalanceInEth.call(accounts[0])).toNumber();

    assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, 'Library function returned unexpected function, linkage may be broken');
  });
  it('should send coin correctly', async () => {
    const metaCoinInstance = await MetaCoin.deployed();

    // Setup 2 accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];

    // Get initial balances of first and second account.
    const accountOneStartingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoStartingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

    // Make transaction from first account to second.
    const amount = 10;
    await metaCoinInstance.sendCoin(accountTwo, amount, { from: accountOne });

    // Get balances of first and second account after the transactions.
    const accountOneEndingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoEndingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

    assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  });
  // ---------------------- ADD TWO TEST CASE ---------------------- //
  it('should exactly the amount user sent have to be checked', async () => {
    const metaCoinInstance = await MetaCoin.deployed();

    let balanceBeforeSend = (await metaCoinInstance.getBalance.call(accounts[1])).toNumber();
    let balanceBeforeReceive = (await metaCoinInstance.getBalance.call(accounts[3])).toNumber();

    await metaCoinInstance.sendCoin(accounts[3], 5, {from: accounts[1]});

    let balanceAfterReceive = (await metaCoinInstance.getBalance.call(accounts[3])).toNumber();
    let balanceAfterSend = (await metaCoinInstance.getBalance.call(accounts[1])).toNumber();

    assert.equal(balanceAfterReceive, balanceBeforeReceive+5);
    assert.equal(balanceAfterSend, balanceBeforeSend-5);
  });

  it('should balance 0 when get balance using not existing address', async () => {
    const metaCoinInstance = await MetaCoin.deployed();

    var crypto = require('crypto');
    var randomAddress = "0x"+ crypto.randomBytes(20).toString('hex');;

    let notExistAddrBalance = (await metaCoinInstance.getBalance.call(randomAddress)).toNumber();

    assert.equal(notExistAddrBalance, 0);
  });
});
