// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract WorkChainEscrow {
    address public owner;

    uint256 public platformFeePercent = 2;
    uint256 public platformFeesBalance;
    uint256 public totalEscrowBalance;

    enum ProjectStatus {
        Created,
        Funded,
        InProgress,
        Completed,
        Disputed,
        Cancelled
    }

    enum MilestoneStatus {
        Pending,
        Submitted,
        Approved,
        Rejected,
        Disputed,
        Paid
    }

    struct Milestone {
        string title;
        uint256 percentage;
        uint256 amount;
        bytes32 evidenceHash;
        string evidenceURI;
        MilestoneStatus status;
    }

    struct Project {
        address payable client;
        address payable worker;
        address moderator;
        uint256 totalAmount;
        uint256 depositedAmount;
        uint256 paidAmount;
        ProjectStatus status;
        bool exists;
    }

    uint256 public projectCounter;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone[]) private projectMilestones;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed client,
        address indexed worker,
        uint256 totalAmount
    );

    event ProjectFunded(
        uint256 indexed projectId,
        uint256 grossAmount,
        uint256 escrowAmount,
        uint256 platformFee
    );

    event MilestoneSubmitted(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        bytes32 evidenceHash,
        string evidenceURI
    );

    event MilestoneApproved(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        uint256 amount
    );

    event MilestoneRejected(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex
    );

    event DisputeOpened(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex
    );

    event PlatformFeesWithdrawn(
        address indexed owner,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier projectExists(uint256 projectId) {
        require(projects[projectId].exists, "Project does not exist");
        _;
    }

    modifier onlyClient(uint256 projectId) {
        require(msg.sender == projects[projectId].client, "Only client");
        _;
    }

    modifier onlyWorker(uint256 projectId) {
        require(msg.sender == projects[projectId].worker, "Only worker");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createProject(
        address payable worker,
        address moderator,
        uint256 totalAmount,
        string[] memory milestoneTitles,
        uint256[] memory milestonePercentages
    ) external returns (uint256) {
        require(worker != address(0), "Invalid worker");
        require(moderator != address(0), "Invalid moderator");
        require(totalAmount > 0, "Invalid amount");
        require(milestoneTitles.length > 0, "At least one milestone required");
        require(
            milestoneTitles.length == milestonePercentages.length,
            "Invalid milestone data"
        );

        uint256 totalPercentage = 0;

        for (uint256 i = 0; i < milestonePercentages.length; i++) {
            require(milestonePercentages[i] > 0, "Invalid percentage");
            totalPercentage += milestonePercentages[i];
        }

        require(totalPercentage == 100, "Percentages must equal 100");

        projectCounter++;

        uint256 projectId = projectCounter;

        projects[projectId] = Project({
            client: payable(msg.sender),
            worker: worker,
            moderator: moderator,
            totalAmount: totalAmount,
            depositedAmount: 0,
            paidAmount: 0,
            status: ProjectStatus.Created,
            exists: true
        });

        for (uint256 i = 0; i < milestoneTitles.length; i++) {
            uint256 milestoneAmount = (totalAmount * milestonePercentages[i]) / 100;

            projectMilestones[projectId].push(
                Milestone({
                    title: milestoneTitles[i],
                    percentage: milestonePercentages[i],
                    amount: milestoneAmount,
                    evidenceHash: bytes32(0),
                    evidenceURI: "",
                    status: MilestoneStatus.Pending
                })
            );
        }

        emit ProjectCreated(projectId, msg.sender, worker, totalAmount);

        return projectId;
    }

    function fundProject(uint256 projectId)
        external
        payable
        projectExists(projectId)
        onlyClient(projectId)
    {
        Project storage project = projects[projectId];

        require(
            project.status == ProjectStatus.Created ||
            project.status == ProjectStatus.Funded,
            "Project cannot be funded"
        );

        require(msg.value > 0, "Deposit required");

        uint256 platformFee = (msg.value * platformFeePercent) / 100;
        uint256 escrowAmount = msg.value - platformFee;

        uint256 newDeposit = project.depositedAmount + escrowAmount;

        require(
            newDeposit <= project.totalAmount,
            "Deposit exceeds project total"
        );

        uint256 minimumDeposit = (project.totalAmount * 60) / 100;

        require(
            newDeposit >= minimumDeposit,
            "Minimum deposit is 60 percent"
        );

        project.depositedAmount = newDeposit;
        project.status = ProjectStatus.Funded;

        platformFeesBalance += platformFee;
        totalEscrowBalance += escrowAmount;

        emit ProjectFunded(projectId, msg.value, escrowAmount, platformFee);
    }

    function submitMilestone(
        uint256 projectId,
        uint256 milestoneIndex,
        bytes32 evidenceHash,
        string memory evidenceURI
    )
        external
        projectExists(projectId)
        onlyWorker(projectId)
    {
        Project storage project = projects[projectId];

        require(
            project.status == ProjectStatus.Funded ||
            project.status == ProjectStatus.InProgress,
            "Project is not active"
        );

        require(
            milestoneIndex < projectMilestones[projectId].length,
            "Invalid milestone"
        );

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];

        require(
            milestone.status == MilestoneStatus.Pending ||
            milestone.status == MilestoneStatus.Rejected,
            "Milestone cannot be submitted"
        );

        require(evidenceHash != bytes32(0), "Evidence hash required");
        require(bytes(evidenceURI).length > 0, "Evidence URI required");

        milestone.evidenceHash = evidenceHash;
        milestone.evidenceURI = evidenceURI;
        milestone.status = MilestoneStatus.Submitted;

        project.status = ProjectStatus.InProgress;

        emit MilestoneSubmitted(
            projectId,
            milestoneIndex,
            evidenceHash,
            evidenceURI
        );
    }

    function approveMilestone(uint256 projectId, uint256 milestoneIndex)
        external
        projectExists(projectId)
        onlyClient(projectId)
    {
        Project storage project = projects[projectId];

        require(
            milestoneIndex < projectMilestones[projectId].length,
            "Invalid milestone"
        );

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];

        require(
            milestone.status == MilestoneStatus.Submitted,
            "Milestone not submitted"
        );

        require(
            project.depositedAmount >= project.paidAmount + milestone.amount,
            "Insufficient deposited funds"
        );

        require(
            totalEscrowBalance >= milestone.amount,
            "Insufficient escrow balance"
        );

        milestone.status = MilestoneStatus.Approved;

        project.paidAmount += milestone.amount;
        totalEscrowBalance -= milestone.amount;

        (bool success, ) = project.worker.call{value: milestone.amount}("");
        require(success, "Payment failed");

        milestone.status = MilestoneStatus.Paid;

        emit MilestoneApproved(projectId, milestoneIndex, milestone.amount);

        if (project.paidAmount >= project.totalAmount) {
            project.status = ProjectStatus.Completed;
        }
    }

    function rejectMilestone(uint256 projectId, uint256 milestoneIndex)
        external
        projectExists(projectId)
        onlyClient(projectId)
    {
        require(
            milestoneIndex < projectMilestones[projectId].length,
            "Invalid milestone"
        );

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];

        require(
            milestone.status == MilestoneStatus.Submitted,
            "Milestone not submitted"
        );

        milestone.status = MilestoneStatus.Rejected;

        emit MilestoneRejected(projectId, milestoneIndex);
    }

    function openDispute(uint256 projectId, uint256 milestoneIndex)
        external
        projectExists(projectId)
    {
        Project storage project = projects[projectId];

        require(
            msg.sender == project.client || msg.sender == project.worker,
            "Only client or worker can open dispute"
        );

        require(
            milestoneIndex < projectMilestones[projectId].length,
            "Invalid milestone"
        );

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];

        require(
            milestone.status == MilestoneStatus.Submitted ||
            milestone.status == MilestoneStatus.Rejected,
            "Cannot dispute this milestone"
        );

        milestone.status = MilestoneStatus.Disputed;
        project.status = ProjectStatus.Disputed;

        emit DisputeOpened(projectId, milestoneIndex);
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 amount = platformFeesBalance;

        require(amount > 0, "No platform fees available");

        platformFeesBalance = 0;

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdraw failed");

        emit PlatformFeesWithdrawn(owner, amount);
    }

    function getMilestonesCount(uint256 projectId)
        external
        view
        projectExists(projectId)
        returns (uint256)
    {
        return projectMilestones[projectId].length;
    }

    function getMilestone(uint256 projectId, uint256 milestoneIndex)
        external
        view
        projectExists(projectId)
        returns (
            string memory title,
            uint256 percentage,
            uint256 amount,
            bytes32 evidenceHash,
            string memory evidenceURI,
            MilestoneStatus status
        )
    {
        require(
            milestoneIndex < projectMilestones[projectId].length,
            "Invalid milestone"
        );

        Milestone memory milestone = projectMilestones[projectId][milestoneIndex];

        return (
            milestone.title,
            milestone.percentage,
            milestone.amount,
            milestone.evidenceHash,
            milestone.evidenceURI,
            milestone.status
        );
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}