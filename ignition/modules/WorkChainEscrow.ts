import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WorkChainEscrowModule = buildModule("WorkChainEscrowModule", (m) => {
  const escrow = m.contract("WorkChainEscrow");

  return { escrow };
});

export default WorkChainEscrowModule;