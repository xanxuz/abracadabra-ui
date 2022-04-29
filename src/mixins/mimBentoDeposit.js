import mimTokenInfo from "@/utils/contracts/mimToken";
import bentoContractsInfo from "@/utils/contracts/master";
import degenBoxInfo from "@/utils/contracts/degenBox";
import { getTokenPriceByAddress } from "../helpers/priceHelper";
import tokensInfo from "@/utils/tokens/addedTokens.js";

export default {
  computed: {
    chainId() {
      return this.$store.getters.getChainId;
    },
    signer() {
      return this.$store.getters.getSigner;
    },
    account() {
      return this.$store.getters.getAccount;
    },
    mimInfo() {
      let id = this.chainId || 1;

      return tokensInfo.find(
        (token) => token.name === "MIM" && token.chain === id
      );
    },
  },
  methods: {
    async createMimBentoInfo() {
      const currentMim = mimTokenInfo.find(
        (token) => token.chainId === this.chainId
      );

      const currentBento = bentoContractsInfo.find(
        (contract) => contract.chainId === this.chainId
      );

      const currentDegen = degenBoxInfo.find(
        (contract) => contract.chainId === this.chainId
      );

      if (!currentMim || !currentBento) {
        console.log("No contracts on this chain!");
        return false;
      }

      let degenBoxContract = null;
      let mimInDegenBalance = null;

      if (currentDegen) {
        degenBoxContract = new this.$ethers.Contract(
          currentDegen.address,
          JSON.stringify(currentDegen.abi),
          this.signer
        );

        mimInDegenBalance = await degenBoxContract.balanceOf(
          currentMim.address,
          this.account
        );
      }

      const bentoBoxContract = new this.$ethers.Contract(
        currentBento.address,
        JSON.stringify(currentBento.abi),
        this.signer
      );

      const mimInBentoBalance = await bentoBoxContract.balanceOf(
        currentMim.address,
        this.account
      );

      const mimContract = new this.$ethers.Contract(
        currentMim.address,
        JSON.stringify(currentMim.abi),
        this.signer
      );

      const mimBalance = await mimContract.balanceOf(this.account);

      const mimPrice = await getTokenPriceByAddress(
        this.chainId,
        this.mimInfo.address
      );

      const bentoBalance = await bentoBoxContract.balanceOf(
        currentMim.address,
        this.account
      );
      const bentoExactBalance = bentoBalance?.toString();

      const degenBalance = await degenBoxContract?.balanceOf(
        currentMim.address,
        this.account
      );
      const degenExactBalance = degenBalance?.toString();

      const mimOnBentoDeposit = {
        mimBalance,
        mimPrice,
        mimInBentoBalance,
        bentoBoxContract,
        degenBoxContract,
        mimInDegenBalance,
        mimContract,
        tokenInfo: currentMim,
        bentoExactBalance,
        degenExactBalance,
      };

      console.log("MIM IN BENTO OBJ", mimOnBentoDeposit);
      this.$store.commit("setMimInBentoDepositObject", mimOnBentoDeposit);
    },
  },
};