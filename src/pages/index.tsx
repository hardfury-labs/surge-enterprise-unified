import { useEffect, useState } from "react";
import { Card, CardBody, Grid, GridItem, Stat, StatLabel, StatNumber, Text } from "@chakra-ui/react";

import { Breadcrumb, Container, Warning } from "@/components/chakra";
import { useStore } from "@/store";
import { humpToDesc } from "@/utils";

const Index = () => {
  const config = useStore((state) => state.config);
  const [summaries, setSummaries] = useState<{
    "Users (Enabled / Total)": string;
    "Subscriptions (Enabled / Total)": string;
    surgeEnterpriseApiToken: string;
  } | null>(null);

  useEffect(() => {
    if (config)
      setSummaries({
        "Users (Enabled / Total)": `${Object.values(config.users).filter((user) => user.enabled).length} / ${
          Object.keys(config.users).length
        }`,
        "Subscriptions (Enabled / Total)": `${
          Object.values(config.subscriptions).filter((subscription) => subscription.enabled).length
        } / ${Object.keys(config.subscriptions).length}`,
        surgeEnterpriseApiToken: config.seApiToken ? "SET" : "NOT SET",
      });
  }, [config]);

  return (
    <>
      <Breadcrumb title="Summary" />

      <Container>
        {config.warnings.length > 0 && (
          <Warning mb={4}>
            {config.warnings.map((text, index) => (
              <Text key={index}>{text}</Text>
            ))}
          </Warning>
        )}

        <Grid templateColumns="repeat(24, 1fr)" gap={6}>
          {summaries &&
            Object.entries(summaries).map(([key, value]) => (
              <GridItem key={key} colSpan={8}>
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>{humpToDesc(key)}</StatLabel>
                      <StatNumber>{value}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
        </Grid>
      </Container>
    </>
  );
};

export default Index;
