export const NOTSTARTED = "notstarted";
export const STARTED = "started";
export const APPROVING = "approving";
export const ISSUING = "issuing";
export const REDEEMING = "redeeming";
export const DONE = "done";

export const WHITE = "#FFFFFF";
export const BLACK = "#0E0E0E";
export const GREEN = "#4DF1A1";
export const OFF_WHITE = "#F2F2F2";
export const PURPLE = "#641CD0";
export const GREY = "#5F5F5F";

const BN = require('bn.js');
const TEN = new BN(10)
export const SIX = TEN.pow(new BN(6));
export const TWELVE = TEN.pow(new BN(12));
export const EIGHTEEN = TEN.pow(new BN(18));
export const GENERATE_TEXT = ["Approve: USDC", "Approve: TUSD", "Approve: PAX", "Generate RSV: Manager"];
export const REDEEM_TEXT = ["Approve: RSV", "Redeem RSV: Manager"];
export const METAMASK_TEXT = "The Metamask extension is required to generate or redeem RSV";
export const HELP_TEXT = "RSV is a decentralized stablecoin collateralized by USDC, TUSD, and PAX that can be generated and redeemed by anyone, anytime. ";

export function getIssuableRSV(usdc, tusd, pax) {
  if (!usdc || !tusd || !pax) { 
    return 0; 
  }
  const usdcBN = new BN(usdc.value);
  const tusdBN = new BN(tusd.value);
  const paxBN = new BN(pax.value);

  return BN.min(BN.min(usdcBN.mul(TWELVE), tusdBN), paxBN).mul(new BN(3)).div(EIGHTEEN).toNumber();
};

export function getRedeemableRSV(rsv) {
  if (!rsv) {
    return 0;
  }

  return rsv.value;
}


export function countOccurrences(arr, elem) {
  var count = 0;
  for (var key in arr) {
    count += (arr[key] === elem);
  }
  return count;
}

export function formatNumber (nativeDecimals, showDecimals) {
  return function(arg) {
    return (arg / Math.pow(10, nativeDecimals)).toFixed(showDecimals);
  }
};
