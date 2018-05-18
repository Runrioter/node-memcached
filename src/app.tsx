import xs from 'xstream'
import {Sources, Sinks} from './interfaces'

export function App(sources : Sources) : Sinks {
  const vtree$ = xs.of(
    <div>My Awesome Cycle.js app</div>
  )

  return {
    DOM: vtree$
  }
}
