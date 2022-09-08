// test if superuse

console.log(!!process.env.SUDO_UID); // SUDO_UID is undefined when not root

throw "error";
