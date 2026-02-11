'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClassPackage } from '@/types';
import { mockDataService } from '@/lib/data';
import { Plus, Tag, CalendarRange, DollarSign } from 'lucide-react';
import { AddPackageModal } from './AddPackageModal';

export function FeePackageList() {
    const [packages, setPackages] = useState<ClassPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPackages = async () => {
            const data = await mockDataService.getPackages();
            setPackages(data);
            setLoading(false);
        };
        loadPackages();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading packages...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Class Fee Packages</CardTitle>
                    <CardDescription>
                        Define fee structures and billing frequencies for various classes.
                    </CardDescription>
                </div>
                <AddPackageModal onAdd={(newPkg) => {
                    setPackages([...packages, newPkg]);
                    mockDataService.logAction(`Created new class package: ${newPkg.title}`, 'admin', 'Billing');
                }} />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Package Title</TableHead>
                            <TableHead>Fee Amount</TableHead>
                            <TableHead>Billing Frequency</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packages.map((pkg) => (
                            <TableRow key={pkg.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-primary" />
                                        {pkg.title}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-semibold text-green-600">
                                        <DollarSign className="h-3 w-3" />
                                        {pkg.fee.toLocaleString()}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="outline" className="flex w-fit items-center gap-1">
                                            <CalendarRange className="h-3 w-3" />
                                            {pkg.frequency}
                                        </Badge>
                                        {pkg.validityPeriod && (
                                            <span className="text-[10px] text-muted-foreground font-mono px-1">Valid: {pkg.validityPeriod}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
