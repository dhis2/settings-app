import PropTypes from 'prop-types'
import React from 'react'
import styles from './SettingsSidebar.module.css'

class SettingsSidebar extends React.Component {
    // d2-ui Sidebar cleared its input here without firing a search.
    // Calling onChangeSearchText('') would debounce into searchSettings('')
    // and bounce every section change back to General.
    clearSearchBox = () => {}

    handleSearchChange = (event) => {
        this.props.onChangeSearchText(event.target.value)
    }

    render() {
        const { sections, currentSection, searchFieldLabel, searchText } =
            this.props

        return (
            <nav className={styles.sidebar} aria-label="Settings">
                <div className={styles.searchWrap}>
                    <input
                        className={styles.search}
                        type="search"
                        placeholder={searchFieldLabel}
                        value={searchText || ''}
                        onChange={this.handleSearchChange}
                    />
                </div>
                <ul className={styles.list}>
                    {sections.map((section) => {
                        const active = section.key === currentSection
                        return (
                            <li key={section.key}>
                                <button
                                    type="button"
                                    className={
                                        active
                                            ? `${styles.item} ${styles.itemActive}`
                                            : styles.item
                                    }
                                    onClick={() =>
                                        this.props.onChangeSection(section.key)
                                    }
                                >
                                    {section.label}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        )
    }
}

SettingsSidebar.propTypes = {
    currentSection: PropTypes.string,
    searchFieldLabel: PropTypes.string,
    searchText: PropTypes.string,
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    onChangeSearchText: PropTypes.func.isRequired,
    onChangeSection: PropTypes.func.isRequired,
}

export default SettingsSidebar
