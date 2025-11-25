import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Ticket {
    _id: string;
    status: 'OPEN' | 'ONGOING' | 'CLOSED';
    priority: 'URGENT' | 'NORMAL';
    lastMessagePreview?: string;
    lastMessageAt?: string;
    customerId: {
        name: string;
    };
}

interface TicketQueueProps {
    tickets: Ticket[];
    selectedTicketId: string | null;
    onSelectTicket: (ticketId: string) => void;
    currentTab: 'OPEN' | 'ONGOING' | 'CLOSED';
    onTabChange: (tab: 'OPEN' | 'ONGOING' | 'CLOSED') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    agentName: string | null;
    completedCount: number;
    searchResults?: Ticket[];
}

export function TicketQueue({
    tickets,
    selectedTicketId,
    onSelectTicket,
    currentTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    agentName,
    completedCount,
    searchResults = [],
}: TicketQueueProps) {
    const [ongoingCount, setOngoingCount] = useState(0);

    useEffect(() => {
        if (!agentName) return;

        const fetchOngoingCount = async () => {
            try {
                const res = await fetch(`/api/agent/ongoing-count?agentName=${agentName}`);
                if (res.ok) {
                    const data = await res.json();
                    setOngoingCount(data.ongoingCount);
                }
            } catch (error) {
                console.error('Error fetching ongoing count:', error);
            }
        };

        fetchOngoingCount();
        const interval = setInterval(fetchOngoingCount, 5000); // Poll every 10s
        return () => clearInterval(interval);
    }, [agentName]);

    return (
        <Card className="h-full border-0 rounded-none flex flex-col shadow-none">
            <CardHeader className="p-4 border-b space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg">Branch Portal</CardTitle>
                        <p className="text-2xs text-muted-foreground">
                            Agent Name: {agentName || 'Agent'}
                        </p>
                        <p className="text-2xs text-muted-foreground">
                            Ongoing: {ongoingCount} &nbsp; Completed: {completedCount}
                        </p>
                    </div>
                </div>

                {/* Search Bar with Dropdown */}
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or message"
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Dropdown Overlay */}
                    {searchQuery && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map((ticket) => (
                                    <div
                                        key={ticket._id}
                                        className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                            onSelectTicket(ticket._id);
                                            onSearchChange(''); // Clear search on select
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-sm">
                                                {ticket.customerId?.name || 'Unknown'}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                {ticket.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {ticket.lastMessagePreview || 'No messages'}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No results found.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex space-x-2">
                    {(['OPEN', 'ONGOING', 'CLOSED'] as const).map((tab) => (
                        <Button
                            key={tab}
                            variant={currentTab === tab ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onTabChange(tab)}
                            className="flex-1 text-xs"
                        >
                            {tab}
                        </Button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0">
                {tickets.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No tickets found.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className={cn(
                                    'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                                    selectedTicketId === ticket._id ? 'bg-blue-50 hover:bg-blue-50' : ''
                                )}
                                onClick={() => onSelectTicket(ticket._id)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm">
                                        {ticket.customerId?.name || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {ticket.lastMessageAt
                                            ? new Date(ticket.lastMessageAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground line-clamp-1 flex-1 mr-2">
                                        {ticket.lastMessagePreview || 'No messages'}
                                    </p>
                                    <div className="flex gap-1">
                                        <Badge
                                            variant={ticket.priority === 'URGENT' ? 'urgent' : 'normal'}
                                            className="text-[10px] px-1.5 py-0"
                                        >
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
