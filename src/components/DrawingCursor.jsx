import React from 'react';
import { connect } from '../store/Connect';
import '../../sass/components/_drawing-cursor.scss';

const DrawingCursor = ({
    display,
    left,
    top,
}) => (
    <div className="drawing-mouse-pointer" style={{ top, left, display }} />
);

export default connect(({ drawingCursor : dc }) => ({
    top: dc.top,
    left: dc.left,
    display: dc.display,
}))(DrawingCursor);
