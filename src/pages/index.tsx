import { useEffect, useState } from "react";
import { Card, CardBody, Grid, GridItem, Stat, StatLabel, StatNumber, Text } from "@chakra-ui/react";

import { Breadcrumb, Container, Warning } from "@/components/chakra";
import { useStore } from "@/store";
import { hump2Desc } from "@/utils";

const Index = () => {
  const config = useStore((state) => state.config);
  const [summaries, setSummaries] = useState<{
    "Enabled Users / Total Users": string;
    providers: number;
    surgeEnterpriseApiToken: string;
  } | null>(null);

  useEffect(() => {
    if (config)
      setSummaries({
        "Enabled Users / Total Users": `${Object.values(config.users).filter((user) => user.enabled).length} / ${
          Object.keys(config.users).length
        }`,
        providers: Object.keys(config.providers).length,
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
                      <StatLabel>{hump2Desc(key)}</StatLabel>
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
