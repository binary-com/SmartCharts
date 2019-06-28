import React, { Component } from 'react';
import { CloseCircleIcon, SearchIcon } from './Icons.jsx';
import { connect } from '../store/Connect';

class SearchInput extends Component {
    clearFilterText = () => {
        this.props.onChange('');
    };

    onChange = (e) => {
        this.props.onChange(e.target.value);
    };

    render() {
        const { placeholder, value, searchInput, searchInputClassName } = this.props;

        return (
            <div className={`cq-lookup-input ${value.trim() !== '' ? 'active' : ''}`}>
                <input
                    className={searchInputClassName}
                    value={value}
                    ref={searchInput}
                    onChange={this.onChange}
                    type="text"
                    spellCheck="off"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    placeholder={placeholder}
                />
                <SearchIcon />
                <CloseCircleIcon className="icon-reset" onClick={this.clearFilterText} />
            </div>
        );
    }
}

export default connect(({ chart: c }) => ({
    isMobile: c.isMobile,
}))(SearchInput);
