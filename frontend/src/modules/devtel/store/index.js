import devspace from './modules/devspace';
import issues from './modules/issues';
import cycles from './modules/cycles';

export default {
    namespaced: true,
    modules: {
        devspace,
        issues,
        cycles,
    },
};
