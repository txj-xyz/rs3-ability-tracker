// Import dependencies.
const [Manager, { screen }] = ['../base/Manager.js', 'electron'].map(require);

// Check if app is running in a dev environment.
module.exports = class Tools extends Manager {

    static init() {
        return {
            centerToParent: window => this.__centerToParent(window),
            center: window => this.__moveCenterDisplay(window),
            inside: coords => this.__insideBounds(coords)
        };
    }

    static __insideBounds = pos => {
        const displays = screen.getAllDisplays();
        return displays.reduce((result, display) => {
            const area = display.workArea;
            return result || (pos.x >= area.x && pos.y >= area.y && pos.x < area.x + area.width && pos.y < area.y + area.height);
        }, false);
    }

    static __moveCenterDisplay = window => {

        if(!window) return null;
        const __bounds = window?.getBounds();
        const isOnScreen = this.__insideBounds({ x: __bounds.x, y: __bounds.y });
        if (!isOnScreen) {
            config.abilityWindow.x = Math.floor((screen.getPrimaryDisplay().workArea.width - config.abilityWindow.width) / 2);
            config.abilityWindow.y = Math.floor((screen.getPrimaryDisplay().workArea.height - config.abilityWindow.height) / 2);
            window?.setPosition(config.abilityWindow.x, config.abilityWindow.y);
        }

        return true;
    };

    static __centerToParent = child => {
        if(!child) return null;
        const [ _newBounds, _mainBounds ] = [ child?.getBounds() ?? null, windows.main?.getBounds() ?? null ];
        const offset = _newBounds && _mainBounds ? (_mainBounds.x - (_newBounds.width - _mainBounds.width) / 2) : null;
        const _newPosition = { x: parseInt(offset), y: _mainBounds.y + 10 };
        const _onScreen = tools.inside({ x: _newPosition.x , y: _newPosition.y });
        
        if(!_onScreen) return this.__moveCenterDisplay(child);

        child.setPosition(parseInt(offset), _mainBounds.y + 10);
        return offset;
    }
};
