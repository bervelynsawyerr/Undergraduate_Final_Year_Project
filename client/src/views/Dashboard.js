import {ContractData, LoadingContainer} from '@drizzle/react-components';
import {DrizzleProvider} from '@drizzle/react-plugin';
import React, {Component} from "react";
import {Spinner} from 'react-bootstrap';
// reactstrap components
import {Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Table} from "reactstrap";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Land from "../artifacts/Land.json";
import "../card.css";
import getWeb3 from "../getWeb3";


const drizzleOptions = {
    contracts: [Land]
}


const row = [];
const totalLands = [];
const totalSellers = [];
const totalRequests = [];
const landOwner = [];

// var requested = false;

class Dashboard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            LandInstance: undefined,
            account: null,
            web3: null,
            count: 0,
            requested: false,
        }
    }

    requestLand = (seller_address, land_id) => async () => {
        await this.state.LandInstance.methods.requestLand(
            seller_address,
            land_id
        ).send({
            from: this.state.account,
            gas: 2100000
        }).then(response => {
            this.props.history.push("#");
        });

        //Reload
        window.location.reload();

    }

    componentDidMount = async () => {
        //For refreshing page only once
        if (!window.location.hash) {
            console.log(window.location.hash);
            window.location = window.location + '#loaded';
            window.location.reload();
        }

        try {
            let i;
//Get network provider and web3 instance
            const web3 = await getWeb3();

            const accounts = await web3.eth.getAccounts();

            const networkId = await web3.eth.net.getId();
            const deployedNetwork = Land.networks[networkId];
            const instance = new web3.eth.Contract(
                Land.abi,
                deployedNetwork && deployedNetwork.address,
            );

            this.setState({LandInstance: instance, web3: web3, account: accounts[0]});

            const currentAddress = await web3.currentProvider.selectedAddress;
            console.log(currentAddress);
            const registered = await this.state.LandInstance.methods.isBuyer(currentAddress).call();
            console.log(registered);
            this.setState({registered: registered});
            let count = await this.state.LandInstance.methods.getLandsCount().call();
            count = parseInt(count);
            console.log(typeof (count));
            console.log(count);
            const verified = await this.state.LandInstance.methods.isVerified(currentAddress).call();
            console.log(verified);

            totalLands.push(<ContractData contract="Land" method="getLandsCount"/>);
            totalSellers.push(<ContractData contract="Land" method="getSellersCount"/>);
            totalRequests.push(<ContractData contract="Land" method="getRequestsCount"/>);

            const rowsArea = [];
            const rowsCity = [];
            const rowsState = [];
            const rowsPrice = [];
            const rowsPID = [];
            const rowsSurvey = [];


            const dict = {};
            for (i = 1; i < count + 1; i++) {
                dict[i] = await this.state.LandInstance.methods.getLandOwner(i).call();
            }

            for (i = 1; i < count + 1; i++) {
                rowsArea.push(
                    <ContractData
                        contract="Land"
                        method="getArea"
                        methodArgs={[i, {from: "0xa42A8B478E5e010609725C2d5A8fe6c0C4A939cB"}]}
                    />
                );
                rowsCity.push(
                    <ContractData
                        contract="Land"
                        method="getCity"
                        methodArgs={[i, {from: "0xa42A8B478E5e010609725C2d5A8fe6c0C4A939cB"}]}
                    />
                );
                rowsState.push(
                    <ContractData
                        contract="Land"
                        method="getState"
                        methodArgs={[i, {from: "0xa42A8B478E5e010609725C2d5A8fe6c0C4A939cB"}]}
                    />
                );
                rowsPrice.push(
                    <ContractData
                        contract="Land"
                        method="getPrice"
                        methodArgs={[i, {from: "0xa42A8B478E5e010609725C2d5A8fe6c0C4A939cB"}]}
                    />
                );
                rowsPID.push(
                    <ContractData
                        contract="Land"
                        method="getPID"
                        methodArgs={[i, {from: "0xa42A8B478E5e010609725C2d5A8fe6c0C4A939cB"}]}
                    />
                );
                rowsSurvey.push(
                    <ContractData
                        contract="Land"
                        method="getSurveyNumber"
                        methodArgs={[i, {from: "0xa42A8B478E5e010609725C2d5A8fe6c0C4A939cB"}]}
                    />
                );
            }

            for (i = 0; i < count; i++) {
                const requested = await this.state.LandInstance.methods.isRequested(i + 1).call();
                row.push(<tr>
                    <td>{i + 1}</td>
                    <td>{rowsArea[i]}</td>
                    <td>{rowsCity[i]}</td>
                    <td>{rowsState[i]}</td>
                    <td>{rowsPrice[i]}</td>
                    <td>{rowsPID[i]}</td>
                    <td>{rowsSurvey[i]}</td>
                    <td>
                        <Button
                            onClick={this.requestLand(dict[i + 1], i + 1)}
                            disabled={!verified || requested}
                            className="button-vote">
                            Request Land
                        </Button>
                    </td>
                </tr>)
            }
            console.log(row);


        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };


    render() {
        if (!this.state.web3) {
            return (
                <div>
                    <div>
                        <h1>
                            <Spinner animation="border" variant="primary"/>
                        </h1>
                    </div>

                </div>
            );
        }

        if (!this.state.registered) {
            return (
                <div className="content">
                    <div>
                        <Row>
                            <Col xs="6">
                                <Card className="card-chart">
                                    <CardBody>
                                        <h1>
                                            You are not verified to view this page
                                        </h1>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                </div>
            );
        }

        return (
            <>
                <div className="content">
                    <DrizzleProvider options={drizzleOptions}>
                        <LoadingContainer>
                            <div className="main-section">
                                <Row>
                                    <Col lg="4">
                                        <div className="dashbord dashbord-skyblue">
                                            <div className="icon-section">
                                                <i className="fa fa-users" aria-hidden="true"></i><br/>
                                                <medium>Total Sellers</medium>
                                                <br/>
                                                <p> {totalSellers} </p>
                                            </div>
                                            <div className="detail-section"><br/>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col lg="4">
                                        <div className="dashbord dashbord-orange">
                                            <div className="icon-section">
                                                <i className="fa fa-landmark" aria-hidden="true"></i><br/>
                                                <medium>Total Registered Lands</medium>
                                                <br/>
                                                <p>{totalLands}</p>
                                            </div>
                                            <div className="detail-section"><br/>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col lg="4">
                                        <div className="dashbord dashbord-blue">
                                            <div className="icon-section">
                                                <i className="fa fa-bell" aria-hidden="true"></i><br/>
                                                <medium>Total Requests</medium>
                                                <br/>
                                                <p>{totalRequests}</p>
                                            </div>
                                            <div className="detail-section">
                                                <br/>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </LoadingContainer>
                    </DrizzleProvider>
                    <Row>
                        <Col lg="4">
                            <Card>
                                <CardHeader>
                                    <h5 className="title">Profile</h5>
                                </CardHeader>
                                <CardBody>
                                    <div className="chart-area">

                                        <Button href="/admin/buyerProfile" className="btn-fill" color="primary">
                                            View Profile
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="4">
                            <Card>
                                <CardHeader>
                                    <h5 className="title">Owned Lands</h5>
                                </CardHeader>
                                <CardBody>
                                    <div className="chart-area">

                                        <Button href="/admin/OwnedLands" className="btn-fill" color="primary">
                                            View Your Lands
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="4">
                            <Card>
                                <CardHeader>
                                    <h5 className="title">Make Payments for Approved Land Requests</h5>
                                </CardHeader>
                                <CardBody>
                                    <div className="chart-area">

                                        <Button href="/admin/MakePayment" className="btn-fill" color="primary">
                                            Make Payment
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <DrizzleProvider options={drizzleOptions}>
                        <LoadingContainer>
                            <Row>
                                <Col lg="12" md="12">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle tag="h4">Lands Info</CardTitle>
                                        </CardHeader>
                                        <CardBody>
                                            <Table className="tablesorter" responsive color="black">
                                                <thead className="text-primary">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Area</th>
                                                    <th>City</th>
                                                    <th>State</th>
                                                    <th>Price</th>
                                                    <th>Property PID</th>
                                                    <th>Survey Number</th>
                                                    <th>Request Land</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {row}
                                                </tbody>
                                            </Table>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </LoadingContainer>
                    </DrizzleProvider>
                </div>
            </>

        );
    }
}


export default Dashboard;
