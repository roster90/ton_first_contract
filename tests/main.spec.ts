import { Cell, toNano } from "ton-core";
import { hex } from "../build/main.compiled.json";
import { Blockchain } from "@ton-community/sandbox";
import { MainContract } from "../wrappers/MainContract";
import "@ton/test-utils";
describe("main.fc contract", () => {
  it("should compile", async () => {
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    const blockChain = await Blockchain.create();
   const myContract =  blockChain.openContract(await MainContract.createFrmConfig({}, codeCell));

    const senderWallet = await blockChain.treasury("sender");

    const messResult = await myContract.sendInternalMessage(senderWallet.getSender(), toNano(0.05)) // 50 000 000

    expect(messResult.transactions).toHaveTransaction({
        from: senderWallet.address,
        to: myContract.address,
        success: true,
    });
    // const data = await myContract.getData();
    // expect(data.recent_sender.toString()).toEqual(senderWallet.address.toString());
    
  });
});
