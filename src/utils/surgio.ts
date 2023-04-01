import type { AxiosResponse } from "axios";
import {
  NodeTypeEnum,
  ShadowsocksJsonSubscribeProviderConfig,
  ShadowsocksNodeConfig,
  SubscriptionUserinfo,
} from "surgio/build/types";
import { fromBase64 } from "surgio/build/utils";
import { parseSSUri } from "surgio/build/utils/ss";

import { Subscription } from "@/types/subscription";

export const subscriptionParsers = {
  // getShadowsocksSubscription
  shadowsocks_subscribe: (
    response: AxiosResponse,
    options: Subscription,
  ): { nodeList: ReadonlyArray<ShadowsocksNodeConfig>; subscriptionUserinfo?: SubscriptionUserinfo } => {
    const nodeList = fromBase64(response.data)
      .split("\n")
      .filter((item) => !!item && item.startsWith("ss://"))
      .map((item): ShadowsocksNodeConfig => {
        const nodeConfig = parseSSUri(item);

        if (typeof options.udpRelay === "boolean") {
          (nodeConfig["udp-relay"] as boolean) = options.udpRelay;
        }

        return nodeConfig;
      });

    return { nodeList };
  },

  // getShadowsocksJSONConfig
  shadowsocks_json_subscribe: (
    response: AxiosResponse,
    options: Subscription,
  ): { nodeList: ReadonlyArray<ShadowsocksNodeConfig> } => {
    const config = JSON.parse(response.data) as {
      configs?: ReadonlyArray<any>;
    };

    if (!config || !config.configs) throw new Error("Invalid ShadowsocksJSONConfig format");

    const nodeList = config.configs.map((item): ShadowsocksNodeConfig => {
      const nodeConfig: any = {
        nodeName: item.remarks as string,
        type: NodeTypeEnum.Shadowsocks,
        hostname: item.server as string,
        port: item.server_port as string,
        method: item.method as string,
        password: item.password as string,
      };

      if (typeof options.udpRelay === "boolean") {
        nodeConfig["udp-relay"] = options.udpRelay;
      }
      if (item.plugin === "obfs-local") {
        const obfs = item.plugin_opts.match(/obfs=(\w+)/);
        const obfsHost = item.plugin_opts.match(/obfs-host=(.+)$/);

        if (obfs) {
          nodeConfig.obfs = obfs[1];
          nodeConfig["obfs-host"] = obfsHost ? obfsHost[1] : "www.bing.com";
        }
      }

      return nodeConfig;
    });

    return { nodeList };
  },
};
