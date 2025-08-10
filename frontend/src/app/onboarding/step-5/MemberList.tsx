import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

const MemberList = () => {
    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Team members list (13)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table></Table>
            </CardContent>
        </Card>
    );
};

export default MemberList;
