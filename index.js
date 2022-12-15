const fetch = require("node-fetch");
const { formatEther } = require("ethers/lib/utils");
require("dotenv").config();

const fetchUpshotWeightings = async (
  address,
  totalSupply,
  name,
  floorPrice
) => {
  console.log("\n\nFetching upshot weightings...");

  let offset = 0;
  let prices = [];
  while (true) {
    const url = `https://api.upshot.xyz/v2/collections/${address}/assets?limit=500&offset=${offset}&include_stats=true&include_count=false&sort_order=last_sale_wei&listing=false`;

    const resp = await fetch(url, {
      headers: {
        accept: "*/*",
        "X-API-Key": process.env.UPSHOT_API_KEY,
      },
    }).then((r) => r.json());

    offset += resp.data.assets.length;
    prices = prices.concat(resp.data.assets);

    if (resp.data.assets.length === 0) break;

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${prices.length} / ${totalSupply}...`);
  }

  const weightings = Object.fromEntries(
    prices.map(({ token_id, appraisal: { wei } }) => [
      token_id,
      Number(formatEther(wei)) / floorPrice,
    ])
  );

  console.log("\n\nUpshot count: ", Object.keys(weightings).length);

  return weightings;
};

const totalSupply = 10000;
const floorPrice = 15;
const nftAddress = "0xed5af388653567af2f388e6224dc7c4b3241c544"; // azukis
fetchUpshotWeightings(nftAddress, totalSupply, floorPrice);
