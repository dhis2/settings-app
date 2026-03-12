/* eslint-disable react/prop-types */
import i18n from '@dhis2/d2-i18n'
import {
    IconChevronDown16,
    IconChevronUp16,
    Layer,
    Popper,
    Button,
} from '@dhis2/ui'
import React, { useRef, useState } from 'react'
import { SketchPicker } from 'react-color'
import { AVAILABLE_COLORS } from './presetColors.js'

const labelStyle = {
    fontSize: 12,
    color: 'rgba(0,0,0,0.80)',
    margin: '15px 0 6px 0',
}

const colorButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    border: '1px solid rgba(0,0,0,0.20)',
    borderRadius: 4,
    background: 'white',
    minWidth: 160,
    cursor: 'pointer',
}

function ColorPicker({ label, onColorPick, color = '' }) {
    const [showPicker, setShowPicker] = useState(false)
    const ref = useRef(null)

    return (
        <div>
            {label && <div style={labelStyle}>{label}</div>}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <button
                    type="button"
                    ref={ref}
                    onClick={() => setShowPicker(true)}
                    style={colorButtonStyle}
                >
                    <svg
                        width="20"
                        height="20"
                        style={{
                            borderRadius: 2,
                            border: '1px solid rgba(0,0,0,0.2)',
                            display: 'inline-block',
                        }}
                    >
                        <rect
                            width="20"
                            height="20"
                            fill={color || 'transparent'}
                        />
                        {!color && (
                            <line
                                x1="0"
                                y1="0"
                                x2="20"
                                y2="20"
                                stroke="red"
                                strokeWidth="1"
                            />
                        )}
                    </svg>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 14 }}>
                        {color || i18n.t('No color selected')}
                    </span>
                    {showPicker ? <IconChevronUp16 /> : <IconChevronDown16 />}
                </button>
                {color && (
                    <Button
                        type="button"
                        onClick={() => {
                            onColorPick({ color: '' })
                            setShowPicker(false)
                        }}
                        secondary
                        destructive
                        small
                    >
                        {i18n.t('Remove color')}
                    </Button>
                )}
            </div>

            {showPicker && (
                <Layer onBackdropClick={() => setShowPicker(false)}>
                    <Popper placement="auto" reference={ref}>
                        {/* todo: account for rtl for popper placement */}
                        <div data-test="colors">
                            <SketchPicker
                                presetColors={AVAILABLE_COLORS}
                                color={color}
                                disableAlpha
                                onChangeComplete={({ hex }) => {
                                    const nextColor = hex === color ? '' : hex
                                    onColorPick({ color: nextColor })
                                }}
                            />
                        </div>
                    </Popper>
                </Layer>
            )}
        </div>
    )
}

export default ColorPicker
