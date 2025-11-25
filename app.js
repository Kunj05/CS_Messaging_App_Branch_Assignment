// seedTickets.js
import Ticket from './models/Ticket.ts'; // adjust path if needed
import dbConnect from './lib/db.ts';


const dummyTickets = [
    {
        customerId: "6925e872c5233bb88d49d611",
        loanAmount: 50000,
        status: "OPEN",
        priority: "URGENT",
        lastMessagePreview: "Customer wants to check loan status",
        lastMessageAt: new Date("2025-11-25T19:00:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925eaa6f9ce12d81391e024",
        loanAmount: 75000,
        status: "OPEN",
        priority: "NORMAL",
        lastMessagePreview: "Customer inquiry about interest rates",
        lastMessageAt: new Date("2025-11-25T19:05:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925edde06f6b66a344b4e83",
        loanAmount: 60000,
        status: "OPEN",
        priority: "URGENT",
        lastMessagePreview: "Customer wants to update contact info",
        lastMessageAt: new Date("2025-11-25T19:10:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925f4ef06f6b66a344b5682",
        loanAmount: 80000,
        status: "OPEN",
        priority: "NORMAL",
        lastMessagePreview: "Customer asking for loan extension",
        lastMessageAt: new Date("2025-11-25T19:15:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925e872c5233bb88d49d611",
        loanAmount: 70000,
        status: "OPEN",
        priority: "NORMAL",
        lastMessagePreview: "Follow up on loan application",
        lastMessageAt: new Date("2025-11-25T19:20:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925eaa6f9ce12d81391e024",
        loanAmount: 55000,
        status: "OPEN",
        priority: "URGENT",
        lastMessagePreview: "Customer needs loan repayment info",
        lastMessageAt: new Date("2025-11-25T19:25:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925edde06f6b66a344b4e83",
        loanAmount: 90000,
        status: "OPEN",
        priority: "NORMAL",
        lastMessagePreview: "Customer inquiry about document submission",
        lastMessageAt: new Date("2025-11-25T19:30:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925f4ef06f6b66a344b5682",
        loanAmount: 65000,
        status: "OPEN",
        priority: "URGENT",
        lastMessagePreview: "Customer wants loan status update",
        lastMessageAt: new Date("2025-11-25T19:35:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925e872c5233bb88d49d611",
        loanAmount: 72000,
        status: "OPEN",
        priority: "URGENT",
        lastMessagePreview: "Customer request for loan modification",
        lastMessageAt: new Date("2025-11-25T19:40:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    },
    {
        customerId: "6925eaa6f9ce12d81391e024",
        loanAmount: 58000,
        status: "OPEN",
        priority: "NORMAL",
        lastMessagePreview: "Customer asking about EMI options",
        lastMessageAt: new Date("2025-11-25T19:45:00Z"),
        assignedAgentId: "6925eacbf9ce12d81391e08f"
    }
];

async function seedTickets() {
    try {
        await dbConnect();
        await Ticket.insertMany(dummyTickets);
        console.log("Dummy tickets inserted successfully");
    } catch (err) {
        console.error("Error inserting tickets:", err);
        process.exit(1);
    }
}

seedTickets();
