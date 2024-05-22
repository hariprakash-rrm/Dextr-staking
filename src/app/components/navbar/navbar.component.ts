import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';
import { switchNetwork, watchAccount, watchNetwork } from '@wagmi/core';
import { configureChains, createConfig } from '@wagmi/core';
import { environment } from '../../../environments/environment.development';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './navbar.component.html',
 
})
export class NavbarComponent {
  allowNetwork:boolean = false
  connector:any
  currentAccount:any

  ngOnInit(): void {
    let localData:any = localStorage.getItem('wagmi.store')
    localData = JSON.parse(localData)
    console.log(localData)
    this.currentAccount=localData?.state?.data?.account
    const chains = environment.SUPPORTED_CHAINS
    const projectId = environment.WALLET_CONNECT_PROJECT_ID;

    const { publicClient } = configureChains(chains, [
      w3mProvider({ projectId }),
    ]);
    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({ projectId, chains }),
      publicClient,
    });
    const ethereumClient = new EthereumClient(wagmiConfig, chains);
    
    this.connector = new Web3Modal(
      {
        themeVariables: {
          '--w3m-font-family': 'Overpass", sans-serif',
          '--w3m-accent-color': '#8E793E',
          '--w3m-text-medium-regular-size': '15px',
          '--w3m-background-color': '#011022',
          // '--w3m-logo-image-url': this.LOGO
        },
        projectId,
      },
      ethereumClient
    );

    watchNetwork((network) => {
      const chainId:any = environment.CHAINID;
      console.log(network?.chain?.id,chainId)
      if (network?.chain?.id ==chainId ) {
        this.allowNetwork = true;
        return
      }
      this.allowNetwork = false;
      alert('Connect bsc testnet - chainId - 97')
    })
    watchAccount((connection) => {
      console.log(connection)
      if(this.currentAccount != connection.address){
        window.location.reload()
      }
    });
  }

}
