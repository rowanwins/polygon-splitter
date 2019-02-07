import test from 'ava'
import { getEdgeIntersection } from '../src/findIntersections'

const e1 = {
  p1: {
    p: [114.58215786065353825, -14.82470576519326144]
  },
  p2: {
    p: [137.21678649707752129, -16.71692980416107588]
  }
}

const e2 = {
  p1: {
    p: [119.1412061636556956, -19.83670052919270788]
  },
  p2: {
    p: [133.06640625, -12.64033830684678961]
  }
}

const e3 = {
  p1: {
    p: [137.21678649707752129, -16.71692980416107588]
  },
  p2: {
    p: [114.58215786065353825, -14.82470576519326144]
  }
}

const e4 = {
  p1: {
    p:[133.06640625, -12.64033830684678961] 
  },
  p2: {
    p: [119.1412061636556956, -19.83670052919270788]
  }
}


test('Find intersecting segments', t => {
  console.log(getEdgeIntersection(e1, e2))
  console.log(getEdgeIntersection(e2, e1))
  console.log(getEdgeIntersection(e3, e4))
  console.log(getEdgeIntersection(e4, e3))
  t.is(2, 2)
})
