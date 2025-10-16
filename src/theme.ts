import {type ThemeConfig } from 'antd';
import './index.css';
/*
  --INFILL: #359EFF;
  --BACKGROUND: #131922;
  --CONTAINER: #232936;
  --HOVER_INFILL: #145087;
  --MINOR_TEXT: #9CA3AF;
  --CORRECT: #34D399;
  --ERROR: #d33434;
  --TEXT: #FFFFFF;
  --HOVER_TEXT: #d9d9d9;
*/


const theme: ThemeConfig = {
  token: {
    borderRadius: 10,
    fontSize: 16,
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },

  components: {
    Button: {
        colorTextLightSolid: '#FFFFFF',
    },
    Input:{
        colorBgContainer: '#232936',
        colorText: '#FFFFFF',
        colorIcon: '#FFFFFF',
        colorIconHover: '#FFFFFF'
    },
    Card:{
        colorBgContainer: '#232936',
    },
    Checkbox: {
        colorText: '#FFFFFF',
    },
    Form: {
      colorTextLabel: '#FFFFFF',
    },

  },
};



export default theme;