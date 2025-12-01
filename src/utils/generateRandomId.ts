import {customAlphabet} from "nanoid";
const nanoId6=customAlphabet("0123456789",6)
export const  generateRandomId=(prefix: string)=> {
  return prefix +nanoId6();
}

