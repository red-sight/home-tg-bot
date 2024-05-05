import { IRouterConfig, config } from '@packages/config';
import { ERouterType, IRouterLease } from '@packages/types';
import { EntwareRouter } from '@packages/devices';
import { Prisma, prisma } from '@packages/db';
import { Flow } from '@packages/flow';
import { randomUUID } from 'crypto';

const routersConfig = config.routers;

const processEntwareLeasesFlow = new Flow<null>({
  name: 'process-entware-leases',
});

processEntwareLeasesFlow.run(async () => {
  await Promise.all(
    routersConfig
      .filter(({ type }) => type === ERouterType.entware)
      .map(async routerConfig => await processEntwareRouter(routerConfig))
  );
});

processEntwareLeasesFlow.queue
  .add(randomUUID(), null, {
    repeat: {
      every: config.dhcpLeasesFetchTimeout,
    },
  })
  .catch(e => console.error(e));

async function processEntwareRouter(
  routerConfig: IRouterConfig
): Promise<void> {
  const router = new EntwareRouter({ ...routerConfig, supressWarnings: true });
  const routerLeases = await processEntwareDhcpLeases(router);
  await processEntwareDbLeases(router, routerLeases);
}

async function processEntwareDhcpLeases(
  router: EntwareRouter
): Promise<IRouterLease[]> {
  let error = '';
  let status = true;
  let routerLeases: IRouterLease[] = [];
  try {
    routerLeases = await router.listLeases();
  } catch (e) {
    status = false;
    error = String(e);
    console.error(e);
  }

  await prisma.routerStatus.create({
    data: {
      routerName: router.name,
      error,
      status,
    },
  });

  await Promise.all(
    routerLeases.map(async ({ ip, name, mac, desc }) => {
      let dbLeaseExist = await prisma.dhcpLease.findUnique({
        where: {
          dhcpMac: mac,
        },
      });
      if (!dbLeaseExist) {
        dbLeaseExist = await prisma.dhcpLease.create({
          data: {
            name,
            dhcpName: name,
            dhcpIp: ip,
            dhcpMac: mac,
            dhcpDesc: desc || '',
            router: router.name,
          },
        });
        // Add inform on new lease flow job there
      }
    })
  );

  return routerLeases;
}

async function processEntwareDbLeases(
  router: EntwareRouter,
  routerLeases: IRouterLease[]
) {
  const dbLeases = await prisma.dhcpLease.findMany({
    where: {
      router: router.name,
    },
  });

  await Promise.all(
    dbLeases.map(async dbLease => {
      const isLeaseActive = routerLeases.find(
        ({ mac }) => mac === dbLease.dhcpMac
      );
      await prisma.dhcpLeaseHistory.create({
        data: {
          dhcpLeaseId: dbLease.id,
          status: !!isLeaseActive,
        },
      });
      await setDhcpLeaseStatus(dbLease);
    })
  );
}

async function setDhcpLeaseStatus({ id }: Prisma.DhcpLease) {
  const history = await prisma.dhcpLeaseHistory.findMany({
    where: {
      dhcpLeaseId: id,
      createdAt: {
        gte: new Date(
          Date.now() -
            config.dhcpLeasesFetchTimeout * config.dhcpLeasesFetchCount
        ),
      },
    },
    orderBy: [{ createdAt: 'desc' }],
  });
  console.table(history);
  if (history.length > config.dhcpLeasesFetchCount) {
    const isActive = history.find(({ status }) => status);

    // add inform on lease active / inactive there

    await prisma.dhcpLeaseStatus.create({
      data: {
        dhcpLeaseId: id,
        status: !!isActive,
      },
    });
  }
}
