import {
  createNavigationContainerRef,
  StackActions,
  CommonActions,
} from '@react-navigation/native';
import * as React from 'react';
export const navigationRef = createNavigationContainerRef();
export const isReadyRef = React.createRef();

// export function navigate(name, params) {
//   if (navigationRef.isReady()) {
//     navigationRef.navigate(name, params);
//   } else {
//     setTimeout(() => navigate(name, params), 100);
//   }
// }

const navigationQueue = [];

export function navigate(name, params) {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    navigationQueue.push({name, params});
  }
}

export function processNavigationQueue() {
  if (isReadyRef.current && navigationRef.current) {
    navigationQueue.forEach(({name, params}) => {
      navigationRef.current.navigate(name, params);
    });

    navigationQueue.length = 0;
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function pop(count = 1) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(count));
  }
}

export function reset(index, routes) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      }),
    );
  }
}

export function replace(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

export function push(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}

export function isNavigatorReady() {
  return navigationRef.isReady();
}

export function handleNavigation(operation, name, params, count) {
  switch (operation) {
    case 'navigate':
      navigate(name, params);
      break;
    case 'goBack':
      goBack();
      break;
    case 'pop':
      pop(count);
      break;
    case 'reset':
      reset(0, [{name: name, params}]);
      break;
    case 'replace':
      replace(name, params);
      break;
    case 'push':
      push(name, params);
      break;
    default:
      console.warn(`Unknown navigation operation: ${operation}`);
  }
}

export function getCurrentRoute() {
  if (navigationRef.isReady() && navigationRef.current) {
    return navigationRef.current.getCurrentRoute();
  }
  return null;
}
