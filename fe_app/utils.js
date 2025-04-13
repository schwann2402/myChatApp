import ProfilePic from "@/assets/images/profile.png";
import { address } from "./api";

function log(...args) {
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (typeof arg === "object") {
      arg = JSON.stringify(arg, null, 2);
    }
    console.log(arg);
  }
}

function thumbnail(url) {
  if (!url) {
    return ProfilePic;
  }
  return {
    uri: "http://" + address + url,
  };
}

export default { log, thumbnail };
