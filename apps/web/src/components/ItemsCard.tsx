import React from "react";

import { Card, CardBody, CardTitle } from "@/components/Card";

export const ItemsCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  children: React.ReactNode;
  subtitle?: React.ReactNode;
}) => (
  <Card className="max-h-full overflow-hidden flex flex-col">
    <CardTitle>{title}</CardTitle>
    {subtitle}
    <CardBody>{children}</CardBody>
  </Card>
);
