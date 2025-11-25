'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    _id: string;
    senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
    senderName: string;
    text: string;
    createdAt: string;
}

interface Ticket {
    _id: string;
    status: 'OPEN' | 'ONGOING' | 'CLOSED';
    priority: 'URGENT' | 'NORMAL';
    loanAmount: number;
    customerId: {
        name: string;
    };
}

export default function CustomerChatPage() {
    const params = useParams();
    const ticketId = params.ticketId as string;
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTicketData = async () => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}`);
            if (!res.ok) return;
            const data = await res.json();
            setTicket(data.ticket);
            setMessages(data.messages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ticket:', error);
        }
    };

    useEffect(() => {
        fetchTicketData();
        const interval = setInterval(fetchTicketData, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !ticket) return;

        setSending(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderType: 'CUSTOMER',
                    senderName: ticket.customerId.name,
                    text: newMessage,
                }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchTicketData(); // Refresh immediately
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Ticket not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
            <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
                <CardHeader className="border-b bg-white rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Support Chat</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Ticket #{ticket._id.slice(-6)} • Loan Amount: ${ticket.loanAmount}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline">{ticket.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={cn(
                                'flex flex-col max-w-[80%]',
                                msg.senderType === 'CUSTOMER' ? 'ml-auto items-end' : 'mr-auto items-start'
                            )}
                        >
                            <div
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm',
                                    msg.senderType === 'CUSTOMER'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-white border text-foreground'
                                )}
                            >
                                {msg.text}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                                {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t bg-white rounded-b-lg">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            disabled={ticket.status === 'CLOSED'}
                        />
                        <Button type="submit" disabled={sending || !newMessage.trim() || ticket.status === 'CLOSED'}>
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                    {ticket.status === 'CLOSED' && (
                        <p className="text-center text-sm text-muted-foreground mt-2">
                            This ticket is closed. You cannot send further messages.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}
