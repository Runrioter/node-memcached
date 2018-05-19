import {run, Drivers, Driver} from '@cycle/run'
import {makeDOMDriver, VNode, DOMSource} from '@cycle/dom'
import {Component, Sinks, Sources} from './interfaces'

import {App} from './app'
import { Stream } from 'xstream';

const main : Component = App

const drivers = {
  DOM: <Driver<Stream<VNode>, DOMSource>>makeDOMDriver('#root')
}

run(main, drivers)
