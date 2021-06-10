import "../components/theme.css";
import "./app.css";
import React, { useState } from "react";
import loadable from "@loadable/component";
import styled from "styled-components/macro";
import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Col, Layout, Menu, Row, Spin } from "antd";
import { Helmet } from "react-helmet";
import { BrowserRouter, NavLink, Route, Switch } from "react-router-dom";
import { ReactComponent as Logo } from "../assets/images/logo.svg";
import AccountStatus from "../components/account-status";
import Footer from "../components/footer";
import NotificationSettings from "../components/notification-settings";
import { ArchonInitializer } from "./archon";
import ChainChangeWatcher from "./chain-change-watcher";
import drizzle from "./drizzle";

const { DrizzleProvider, Initializer } = drizzleReactHooks;

export default function App() {
  const [isMenuClosed, setIsMenuClosed] = useState(true);

  return (
    <>
      <Helmet>
        <title>Kleros · Court</title>
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,500,500i,700,700i" rel="stylesheet" />
      </Helmet>
      <DrizzleProvider drizzle={drizzle}>
        <Initializer
          error={<C404 Web3 />}
          loadingContractsAndAccounts={<C404 Web3 />}
          loadingWeb3={<StyledSpin tip="Connecting to your Web3 provider." />}
        >
          <ChainChangeWatcher>
            <ArchonInitializer>
              <BrowserRouter>
                <Layout>
                  <StyledLayoutSider
                    breakpoint="md"
                    collapsedWidth="0"
                    collapsed={isMenuClosed}
                    onClick={() => setIsMenuClosed((previousState) => !previousState)}
                  >
                    <Menu theme="dark">{MenuItems}</Menu>
                  </StyledLayoutSider>
                  <Layout>
                    <StyledLayoutHeader>
                      <Row>
                        <StyledLogoCol lg={4} md={4} sm={12} xs={0}>
                          <LogoNavLink to="/">
                            <Logo />
                          </LogoNavLink>
                        </StyledLogoCol>
                        <Col lg={14} md={12} xs={0} style={{ padding: "0 16px" }}>
                          <StyledMenu mode="horizontal" theme="dark">
                            {MenuItems}
                          </StyledMenu>
                        </Col>
                        <StyledTrayCol lg={6} md={8} sm={12} xs={24}>
                          <StyledTray>
                            <AccountStatus />
                            <NotificationSettings settings={settings} />
                          </StyledTray>
                        </StyledTrayCol>
                      </Row>
                    </StyledLayoutHeader>
                    <StyledLayoutContent>
                      <Switch>
                        <Route exact path="/">
                          <Home />
                        </Route>
                        <Route exact path="/courts">
                          <Courts />
                        </Route>
                        <Route exact path="/cases">
                          <Cases />
                        </Route>
                        <Route exact path="/cases/:ID" component={Case} />
                        <Route exact path="/tokens">
                          <Tokens />
                        </Route>
                        <Route exact path="/token-bridge">
                          <TokenBridge />
                        </Route>
                        <Route path="*">
                          <C404 />
                        </Route>
                      </Switch>
                    </StyledLayoutContent>
                    <Footer />
                    <StyledClickaway
                      isMenuClosed={isMenuClosed}
                      onClick={isMenuClosed ? null : () => setIsMenuClosed(true)}
                    />
                  </Layout>
                </Layout>
              </BrowserRouter>
            </ArchonInitializer>
          </ChainChangeWatcher>
        </Initializer>
      </DrizzleProvider>
    </>
  );
}

const StyledSpin = styled(Spin)`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const C404 = loadable(() => import(/* webpackPrefetch: true */ "../containers/404"), {
  fallback: <StyledSpin />,
});

const Home = loadable(() => import(/* webpackPrefetch: true */ "../containers/home"), {
  fallback: <StyledSpin />,
});

const Courts = loadable(() => import(/* webpackPrefetch: true */ "../containers/courts"), {
  fallback: <StyledSpin />,
});

const Cases = loadable(() => import(/* webpackPrefetch: true */ "../containers/cases"), {
  fallback: <StyledSpin />,
});

const Case = loadable(
  async ({
    match: {
      params: { ID },
    },
  }) => {
    try {
      await drizzle.contracts.KlerosLiquid.methods.disputes(ID).call();
    } catch (err) {
      console.error(err);
      return C404;
    }
    return import(/* webpackPrefetch: true */ "../containers/case");
  },
  {
    fallback: <StyledSpin />,
  }
);

const Tokens = loadable(() => import(/* webpackPrefetch: true */ "../containers/tokens"), {
  fallback: <StyledSpin />,
});

const TokenBridge = loadable(() => import(/* webpackPrefetch: true */ "../containers/token-bridge"), {
  fallback: <StyledSpin />,
});

const MenuItems = [
  <Menu.Item key="home">
    <NavLink to="/">Home</NavLink>
  </Menu.Item>,
  <Menu.Item key="courts">
    <NavLink to="/courts">Courts</NavLink>
  </Menu.Item>,
  <Menu.Item key="cases">
    <NavLink to="/cases">My Cases</NavLink>
  </Menu.Item>,
  <Menu.Item key="guide">
    <a
      href="https://blog.kleros.io/become-a-juror-blockchain-dispute-resolution-on-ethereum/"
      rel="noopener noreferrer"
      target="_blank"
    >
      Guide
    </a>
  </Menu.Item>,
];

const settings = {
  draw: "When I am drawn as a juror.",
  appeal: "When a case I ruled is appealed.",
  key: "court",
  lose: "When I lose tokens.",
  win: "When I win arbitration fees.",
  stake: "When my stakes are changed.",
};

const StyledLayoutSider = styled(Layout.Sider)`
  height: 100%;
  position: fixed;
  z-index: 2000;

  @media (min-width: 768px) {
    display: none;
  }

  .ant-layout-sider-zero-width-trigger {
    right: -50px;
    top: 12px;
    width: 50px;
  }
`;

const StyledLogoCol = styled(Col)`
  display: flex;
  align-items: center;
  height: 64px;

  @media (max-width: 769.98px) {
    padding-left: 1rem;
  }

  @media (max-width: 575px) {
    &.ant-col-xs-0 {
      display: none;
    }
  }
`;

const StyledTrayCol = styled(Col)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 64px;
`;

const StyledMenu = styled(Menu)`
  font-weight: 500;
  line-height: 64px !important;
  text-align: center;

  .ant-menu-item-selected {
    background-color: transparent !important;
  }
`;

const StyledLayoutContent = styled(Layout.Content)`
  background: #f2e3ff;
  // The header takes exactly 64px
  min-height: calc(100vh - 64px);
  padding: 0px 9.375vw 120px 9.375vw;
`;

const StyledLayoutHeader = styled(Layout.Header)`
  height: auto;
  line-height: initial;
`;

const StyledTray = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  > * {
    min-width: 0;
  }
`;

const StyledClickaway = styled.div`
  background-color: black;
  height: 100%;
  opacity: ${(properties) => (properties.isMenuClosed ? 0 : 0.4)};
  pointer-events: ${(properties) => (properties.isMenuClosed ? "none" : "auto")};
  position: fixed;
  transition: opacity 0.3s;
  width: 100%;
`;

const LogoNavLink = styled(NavLink)`
  display: inline-block;
  max-width: 120px;

  > svg {
    display: block;
    width: 100%;
  }
`;
