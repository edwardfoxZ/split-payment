const SplitPayment = artifacts.require("SplitPayment");

contract("SplitPayment", (accounts) => {
  let splitPayment;

  before(async () => {
    splitPayment = await SplitPayment.new(accounts[0], { from: accounts[0] });
  });

  it("Should split payment", async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]];
    const amounts = [
      web3.utils.toWei("40", "wei"),
      web3.utils.toWei("20", "wei"),
      web3.utils.toWei("10", "wei"),
    ];

    const initialBalances = await Promise.all(
      recipients.map((recipient) => web3.eth.getBalance(recipient))
    );

    const totalAmount = amounts.reduce(
      (sum, value) => web3.utils.toBN(sum).add(web3.utils.toBN(value)),
      web3.utils.toBN(0)
    );

    await splitPayment.send(recipients, amounts, {
      from: accounts[0],
      value: totalAmount.toString(),
    });

    const finalBalances = await Promise.all(
      recipients.map((recipient) => web3.eth.getBalance(recipient))
    );

    recipients.forEach((_item, i) => {
      const finalBalance = web3.utils.toBN(finalBalances[i]);
      const initialBalance = web3.utils.toBN(initialBalances[i]);
      const expectedIncrease = web3.utils.toBN(amounts[i]);
      assert(
        finalBalance.sub(initialBalance).eq(expectedIncrease),
        `Recipient ${i} balance mismatch: expected increase ${expectedIncrease.toString()}, got ${finalBalance
          .sub(initialBalance)
          .toString()}`
      );
    });
  });

  it("Should not split payment if array is mismatched with amounts", async () => {
    const recipients = [accounts[1], accounts[2]];
    const amounts = [
      web3.utils.toWei("40", "wei"),
      web3.utils.toWei("20", "wei"),
      web3.utils.toWei("10", "wei"),
    ];

    try {
      await splitPayment.send(recipients, amounts, {
        from: accounts[0],
        value: web3.utils.toWei("90", "wei"),
      });
      assert.fail("The transaction should have failed due to mismatched array lengths!");
    } catch (e) {
      assert(
        e.message.includes("Recipients and amounts length mismatch"),
        `Expected mismatch error, but got: ${e.message}`
      );
    }
  });

  it("Should not split payment if caller isn't owner!", async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]];
    const amounts = [
      web3.utils.toWei("40", "wei"),
      web3.utils.toWei("20", "wei"),
      web3.utils.toWei("10", "wei"),
    ];

    try {
      await splitPayment.send(recipients, amounts, {
        from: accounts[5], // Non-owner account
        value: web3.utils.toWei("90", "wei"),
      });
      assert.fail("The transaction should have failed as the caller is not the owner!");
    } catch (e) {
      assert(
        e.message.includes("Only owner can send a Tx!"),
        `Expected owner restriction error, but got: ${e.message}`
      );
    }
  });
});
