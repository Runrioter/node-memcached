import xs from 'xstream'
import {Sources, Sinks} from './interfaces'
import { h1, div, p, input } from '@cycle/dom';

export function App(sources : Sources) : Sinks {
  // const vtree$ = xs.periodic(1000).map(i => 
  //   h1(`${i} seconds elapsed`)
  // );

  // return {
  //   DOM: vtree$
  // }
  const sinks = {
    DOM: sources.DOM.select('input').events('click')
      .map(ev => ev.target.checked)
      .startWith(false)
      .map(toggled =>
        div([
          input({attrs: {type: 'checkbox'}}), 'Toggle me',
          p(toggled ? 'ON' : 'off')
        ])
      )
  };
  return sinks;
}
