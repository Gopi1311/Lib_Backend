export const  generateRandomId=(prefix: string)=> {
  return prefix + Math.floor(100000 + Math.random() * 900000);
}

