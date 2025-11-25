import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, DollarSign, AlertCircle } from 'lucide-react';

interface Ticket {
    _id: string;
    status: 'OPEN' | 'ONGOING' | 'CLOSED';
    priority: 'URGENT' | 'NORMAL';
    loanAmount: number;
    customerId: {
        name: string;
        phone: string;
    };
}

interface CustomerProfileProps {
    ticket: Ticket | null;
}

export function CustomerProfile({ ticket }: CustomerProfileProps) {
    if (!ticket) {
        return (
            <Card className="h-full rounded-none border-l bg-gray-50/50">
                <CardContent className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No ticket selected
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full rounded-none border-l">
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="font-semibold">{ticket.customerId.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p className="font-semibold">{ticket.customerId.phone}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-full">
                            <DollarSign className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Loan Amount</p>
                            <p className="font-semibold">${ticket.loanAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Ticket Details</h4>

                    <div className="flex justify-between items-center">
                        <span className="text-sm">Priority</span>
                        <Badge variant={ticket.priority === 'URGENT' ? 'urgent' : 'normal'}>
                            {ticket.priority}
                        </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm">Status</span>
                        <Badge variant="outline">{ticket.status}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
