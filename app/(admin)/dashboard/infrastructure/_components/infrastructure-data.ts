import type { SimpleIcon } from "simple-icons";
import { siNextdotjs, siNodedotjs, siReact, siRemix } from "simple-icons";

export interface InfrastructureEnvironment {
  domain: string;
  platform: {
    name: string;
    icon: SimpleIcon;
  };
  environment: "Expired" | "Production" | "Staging";
  status: "Online" | "Unhealthy";
  latencyMs: number;
  uptime: { days: number; hours: number };
  server: string;
  countryCode: string;
  plan: string;
  resources: {
    cpu: number;
    ram: number;
    disk: number;
  };
}

export interface InfrastructureGroup {
  name: string;
  organization: string;
  rows: InfrastructureEnvironment[];
}

export const infrastructureGroups: InfrastructureGroup[] = [
  {
    name: "Admin Console",
    organization: "Weblabs Studio",
    rows: [
      {
        domain: "next-shadcn-admin-dashboard.vercel.app/dashboard",
        platform: {
          name: "Next.js",
          icon: siNextdotjs,
        },
        environment: "Expired",
        status: "Unhealthy",
        latencyMs: 86,
        uptime: { days: 8, hours: 23 },
        server: "Hetzner Cloud",
        countryCode: "DE",
        plan: "CX33, Falkenstein",
        resources: { cpu: 60, ram: 73, disk: 41 },
      },
    ],
  },
  {
    name: "Analytics",
    organization: "Aiy Cap",
    rows: [
      {
        domain: "next-shadcn-admin-dashboard.vercel.app/analytics",
        platform: {
          name: "React",
          icon: siReact,
        },
        environment: "Production",
        status: "Online",
        latencyMs: 246,
        uptime: { days: 9, hours: 23 },
        server: "AWS",
        countryCode: "NL",
        plan: "eu-west-1, Amsterdam",
        resources: { cpu: 49, ram: 42, disk: 44 },
      },
      {
        domain: "next-shadcn-admin-dashboard.vercel.app/reports",
        platform: {
          name: "Remix",
          icon: siRemix,
        },
        environment: "Staging",
        status: "Online",
        latencyMs: 110,
        uptime: { days: 9, hours: 23 },
        server: "Azure",
        countryCode: "EE",
        plan: "North Europe, Tallinn",
        resources: { cpu: 37, ram: 46, disk: 64 },
      },
    ],
  },
  {
    name: "Kanban",
    organization: "Storeframe",
    rows: [
      {
        domain: "next-shadcn-admin-dashboard.vercel.app/kanban",
        platform: {
          name: "Node.js",
          icon: siNodedotjs,
        },
        environment: "Production",
        status: "Online",
        latencyMs: 25,
        uptime: { days: 10, hours: 23 },
        server: "Bare Metal / Custom",
        countryCode: "DE",
        plan: "EX101, Falkenstein",
        resources: { cpu: 1, ram: 21, disk: 4 },
      },
    ],
  },
  {
    name: "Inbox",
    organization: "Acme Corp",
    rows: [],
  },
];
