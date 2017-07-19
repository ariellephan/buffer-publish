import React from 'react';
import {
  action,
  storiesOf,
} from '@storybook/react';
import uuid from 'uuid';
import { checkA11y } from 'storybook-addon-a11y';
import Tabs from './index';
import Tab from '../Tab/index';
import DropdownTab from '../DropdownTab/index';
import DropdownItem from '../DropdownItem/index';

storiesOf('Tabs')
  .addDecorator(checkA11y)
  .add('default', () => (
    <Tabs
      activeTabId={''}
    >
      <Tab tabId={uuid()} active onClick={action('tab-click')}>Queue (1)</Tab>
      <Tab tabId={uuid()} active onClick={action('tab-click')}>Sent Posts</Tab>
      <Tab tabId={uuid()} active onClick={action('tab-click')}>Settings</Tab>
    </Tabs>
  ))
  .add('with one active tab', () => (
    <Tabs
      activeTabId={'12345'}
      onTabClick={action('on-tab-click')}
    >
      <Tab tabId={'12345'} active onClick={action('tab-click')}>Queue (1)</Tab>
      <Tab tabId={uuid()} active onClick={action('tab-click')}>Sent Posts</Tab>
      <Tab tabId={uuid()} active onClick={action('tab-click')}>Settings</Tab>
    </Tabs>
  ))
  .add('with a dropdown tab', () => (
    <Tabs
      activeTabId={'12345'}
    >
      <Tab tabId={uuid()} active onClick={action('tab-click')}>Queue (1)</Tab>
      <Tab tabId={uuid()} active onClick={action('tab-click')}>Sent Posts</Tab>
      <DropdownTab
        active
        title={'Settings'}
        isDropdownShown
        onClick={action('on-click')}
      >
        <DropdownItem onClick={action('on-click')}>Posting Schedule</DropdownItem>
        <DropdownItem onClick={action('on-click')}>Empty your Queue</DropdownItem>
        <DropdownItem onClick={action('on-click')}>Disconnect this account</DropdownItem>
      </DropdownTab>
    </Tabs>
  ));