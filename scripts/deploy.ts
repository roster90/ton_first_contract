import { Cell, StateInit, beginCell, contractAddress, storeStateInit, toNano } from "ton-core";
import { hex } from "../build/main.compiled.json";
import qs from "qs";
import qrcode from "qrcode-terminal";
import dotvn from 'dotenv'

async function deployScript() {
    dotvn.config();

    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    const dataCell = new Cell();

    const stateInit : StateInit = {
        code: codeCell,
        data: dataCell,
    }
    const stateBuilder  = beginCell();
    storeStateInit(stateInit)(stateBuilder);
    const stateInitCell = stateBuilder.endCell();
    // const stateInitCell = beginCell().storeBit(false).storeBit(false).storeMaybeRef(codeCell).storeMaybeRef(dataCell).storeUint(0,1).endCell();   //low level

    const address = contractAddress(0, {
        code: codeCell,
        data: dataCell,
    });
    
    let link =
    `https://test.tonhub.com/transfer/` +
    address.toString({
      testOnly: true,
    }) + "?" +
    qs.stringify({
      text: "Deploy contract",
      amount: toNano("0.01").toString(10),
      init: stateInitCell.toBoc({ idx: false }).toString("base64"),
    });

    qrcode.generate(link, { small: true }, (code) => {console.log(code);});
    
    console.log(`Deploying contract to address: ${address.toString()}`);
    

    
}

deployScript();