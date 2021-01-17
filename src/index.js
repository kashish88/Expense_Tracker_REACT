import React from 'react';
import ReactDOM from 'react-dom';
import {SpeechProvider} from '@speechly/react-client'

//import App1 from './App1';
import {Provider} from './context/context'
import App2 from './App2';
import './index.css'

ReactDOM.render(
  <SpeechProvider appId="7e10aba6-f1cc-4178-bce7-29a4f15b42dc" language="en-US">
   <Provider>
    <App2 />
    </Provider>
    </SpeechProvider>,

  document.getElementById('root')
);

