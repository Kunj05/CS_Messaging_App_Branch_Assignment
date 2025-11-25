'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TicketQueue } from '@/components/agent/TicketQueue';
import { ChatWindow } from '@/components/agent/ChatWindow';
import { CustomerProfile } from '@/components/agent/CustomerProfile';
import { Loader2 } from 'lucide-react';

export default function AgentDashboardPage() {
    const router = useRouter();
    const [agentName, setAgentName] = useState<string | null>(null);
    const [tickets, setTickets] = useState([]);
    const [searchResults, setSearchResults] = useState([]); // New state for dropdown results
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [cannedResponses, setCannedResponses] = useState([]);
    const [currentTab, setCurrentTab] = useState<'OPEN' | 'ONGOING' | 'CLOSED'>('OPEN');
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        const name = localStorage.getItem('agentName');
        if (!name) {
            router.push('/agent');
        } else {
            setAgentName(name);
            setLoading(false);
        }
    }, [router]);

    // Fetch Agent Stats
    useEffect(() => {
        if (!agentName) return;
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/agent/stats?agentName=${agentName}`);
                if (res.ok) {
                    const data = await res.json();
                    setCompletedCount(data.completedCount);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 1000); // Poll stats every 1s
        return () => clearInterval(interval);
    }, [agentName]);

    // Fetch Canned Responses once
    useEffect(() => {
        const fetchCanned = async () => {
            try {
                const res = await fetch('/api/agent/canned-responses');
                if (res.ok) {
                    const data = await res.json();
                    setCannedResponses(data);
                }
            } catch (error) {
                console.error('Error fetching canned responses:', error);
            }
        };
        fetchCanned();
    }, []);

    // Poll Tickets (Main List - Current Tab)
    const fetchTickets = async () => {
        try {
            // Only fetch for current tab, ignore search query for main list
            const res = await fetch(`/api/agent/tickets?status=${currentTab}&limit=10&agentName=${agentName || ''}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 2000);
        return () => clearInterval(interval);
    }, [currentTab, agentName]); // Re-fetch when tab or agent changes

    // Fetch Search Results (Dropdown - Global Search)
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                // Search ALL statuses
                const res = await fetch(`/api/agent/tickets?status=ALL&limit=10&search=${searchQuery}&agentName=${agentName || ''}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        };

        // Debounce search slightly or just run it
        const timeoutId = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, agentName]);

    // Poll Selected Ticket & Messages
    const fetchSelectedTicket = async () => {
        if (!selectedTicketId) return;
        try {
            const res = await fetch(`/api/tickets/${selectedTicketId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedTicket(data.ticket);
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching ticket details:', error);
        }
    };

    useEffect(() => {
        fetchSelectedTicket();
        const interval = setInterval(fetchSelectedTicket, 3000);
        return () => clearInterval(interval);
    }, [selectedTicketId]);

    const handleSendMessage = async (text: string) => {
        if (!selectedTicketId || !agentName) return;
        try {
            const res = await fetch(`/api/tickets/${selectedTicketId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderType: 'AGENT',
                    senderName: agentName,
                    text,
                }),
            });
            console.log('Message sent response:', res.status);
            if (!res.ok) {
                const err = await res.json();
                console.error('Message send failed:', err);
            }
            fetchSelectedTicket(); // Refresh immediately
            fetchTickets(); // Refresh list preview
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleAssign = async () => {
        if (!selectedTicketId || !agentName) return;
        try {
            const res = await fetch(`/api/agent/tickets/${selectedTicketId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentName }),
            });

            if (!res.ok) {
                if (res.status === 409) {
                    alert('This ticket has already been assigned to another agent.');
                } else {
                    console.error('Failed to assign ticket');
                }
                // Refresh to show updated status
                fetchTickets();
                fetchSelectedTicket();
                return;
            }

            fetchSelectedTicket();
            fetchTickets();
            setCurrentTab('ONGOING');
        } catch (error) {
            console.error('Error assigning ticket:', error);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicketId) return;
        try {
            await fetch(`/api/tickets/${selectedTicketId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CLOSED' }),
            });
            fetchSelectedTicket();
            fetchTickets();
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Panel: Ticket Queue (25%) */}
            <div className="w-1/4 min-w-[250px] max-w-[350px] bg-white border-r">
                <TicketQueue
                    tickets={tickets}
                    selectedTicketId={selectedTicketId}
                    onSelectTicket={setSelectedTicketId}
                    currentTab={currentTab}
                    onTabChange={(tab) => {
                        setCurrentTab(tab);
                        setSelectedTicketId(null); // Deselect when changing tabs
                    }}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    agentName={agentName}
                    completedCount={completedCount}
                    searchResults={searchResults}
                />
            </div>

            {/* Center Panel: Chat Window (50%) */}
            <div className="flex-1 bg-white flex flex-col min-w-[400px]">
                <ChatWindow
                    ticket={selectedTicket}
                    messages={messages}
                    currentAgentName={agentName}
                    onSendMessage={handleSendMessage}
                    onAssign={handleAssign}
                    onCloseTicket={handleCloseTicket}
                    cannedResponses={cannedResponses}
                />
            </div>

            {/* Right Panel: Customer Profile (25%) */}
            <div className="w-1/4 min-w-[250px] max-w-[350px] bg-white border-l">
                <CustomerProfile ticket={selectedTicket} />
            </div>
        </div>
    );
}
