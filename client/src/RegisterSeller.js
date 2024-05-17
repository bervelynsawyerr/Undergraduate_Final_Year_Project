import React, {Component} from 'react'
import {Button, FormControl, FormFile, FormGroup, Spinner} from 'react-bootstrap'

import LandContract from "./artifacts/Land.json"
import getWeb3 from "./getWeb3"
import ipfs from './ipfs';


//import Navigation from './Navigation'

class RegisterSeller extends Component {
    constructor(props) {
        super(props)

        this.state = {
            LandInstance: undefined,
            account: null,
            web3: null,
            name: '',
            age: '',
            ghanaCardNumber: '',
            tinNumber: '',
            landsOwned: '',
            isVerified: false,
            buffer2: null,
            document: '',
        }
        this.captureDoc = this.captureDoc.bind(this);
        this.addDoc = this.addDoc.bind(this);
    }

    componentDidMount = async () => {
        //For refreshing page only once
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }

        try {
            //Get network provider and web3 instance
            const web3 = await getWeb3();

            const accounts = await web3.eth.getAccounts();

            const networkId = await web3.eth.net.getId();
            const deployedNetwork = LandContract.networks[networkId];
            const instance = new web3.eth.Contract(
                LandContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            this.setState({LandInstance: instance, web3: web3, account: accounts[0]});


        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    addDoc = async () => {
        // alert('In add image')
        await ipfs.files.add(this.state.buffer2, (error, result) => {
            if (error) {
                alert(error)
                return
            }

            alert(result[0].hash)
            this.setState({document: result[0].hash});
            console.log('document:', this.state.document);
        })
    }

    RegisterSeller = async () => {
        await this.addDoc();
        // alert('After add image')
        const pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        await new Promise(resolve => setTimeout(resolve, 10000));
        if (this.state.name === '' || this.state.age === '' || this.state.ghanaCardNumber === '' || this.state.tinNumber === '' || this.state.landsOwned === '') {
            alert("All the fields are compulsory!");
        } else if (!Number(this.state.ghanaCardNumber) || this.state.ghanaCardNumber.length != 12) {
            alert("Ghana Card Number should be 12 digits long!");
        } else if (this.state.tinNumber.length !== 10) {
            alert("Pan Number should be a 10 digit unique number!");
        } else if (!Number(this.state.age) || this.state.age < 21) {
            alert("Your age must be a number");
        } else {
            await this.state.LandInstance.methods.registerSeller(
                this.state.name,
                this.state.age,
                this.state.ghanaCardNumber,
                this.state.tinNumber,
                this.state.landsOwned,
                this.state.document)
                .send({
                    from: this.state.account,
                    gas: 2100000
                }).then(response => {
                    this.props.history.push("/Seller/SellerDashboard");
                });

            //Reload
            window.location.reload(false);
        }
    }

    updateName = event => (
        this.setState({name: event.target.value})
    )
    updateAge = event => (
        this.setState({age: event.target.value})
    )
    updateGhanaCard = event => (
        this.setState({ghanaCardNumber: event.target.value})
    )
    updateTinNumber = event => (
        this.setState({tinNumber: event.target.value})
    )
    updateOwnedLands = event => (
        this.setState({landsOwned: event.target.value})
    )

    captureDoc(event) {
        event.preventDefault()
        const file2 = event.target.files[0]
        const reader2 = new window.FileReader()
        reader2.readAsArrayBuffer(file2)
        reader2.onloadend = () => {
            this.setState({buffer2: Buffer(reader2.result)})
            console.log('buffer2', this.state.buffer2)
        }
        console.log('capture doc...')
    }

    render() {
        if (!this.state.web3) {
            return (
                <div>
                    <div className="img-wrapper">
                        <img src="https://i.pinimg.com/originals/71/6e/00/716e00537e8526347390d64ec900107d.png"
                             className="logo" alt=""/>
                        <div className="wine-text-container">
                            <div className="site-title wood-text">Own Chain</div>
                        </div>
                    </div>
                    <div className="auth-wrapper">
                        <div className="auth-inner">
                            <div>
                                <div>
                                    <h1>
                                        <Spinner animation="border" variant="warning"/>
                                    </h1>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bodyC">

                <div className="img-wrapper">
                    <img src="https://i.pinimg.com/originals/71/6e/00/716e00537e8526347390d64ec900107d.png"
                         className="logo" alt=""/>
                    <div className="wine-text-container">
                        <div className="site-title wood-text">Own Chain</div>
                    </div>
                </div>
                <div className="auth-wrapper">
                    <div className="auth-inner">
                        <div className="App">

                            <div>
                                <div>
                                    <h1 style={{color: "black"}}>
                                        Seller Registration
                                    </h1>
                                </div>
                            </div>


                            <div className="form">
                                <FormGroup>
                                    <div className="form-label">
                                        Enter Name
                                    </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.name}
                                            onChange={this.updateName}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="form-label">
                                        Enter Age
                                    </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.age}
                                            onChange={this.updateAge}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="form-label">
                                        Enter Ghana Card No
                                    </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.ghanaCardNumber}
                                            onChange={this.updateGhanaCard}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="form-label">
                                        Enter TIN no
                                    </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.tinNumber}
                                            onChange={this.updateTinNumber}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="form-label">
                                        Enter Owned Lands
                                    </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.landsOwned}
                                            onChange={this.updateOwnedLands}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <label>Add your Ghana Card (PDF Format)</label>
                                    <FormFile
                                        id="File2"
                                        onChange={this.captureDoc}
                                    />
                                </FormGroup>


                                <Button onClick={this.registerSeller} className="button-vote">
                                    Register as Seller
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );

    }
}

export default RegisterSeller;
