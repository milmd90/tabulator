import React from 'react';
import SetNumChords from './SetNumChords';

function Config(props: {
  showRhythm: boolean,
  toggleShowRhythm: React.ChangeEventHandler<HTMLInputElement>,
  showColors: boolean,
  toggleShowColors: React.ChangeEventHandler<HTMLInputElement>,
  numColumns: number,
  setNumColumns: (numColumns: number) => void,
  numRows: number,
  setNumRows: (numRows: number) => void,
  downloadTab: () => void,
}) {
  return (
    <div id="config">
      <h3>Config Options</h3>
      <div>
        <div id="config-options">
          <div id='colors' className='config-option'>
            <input 
              id='color-checkbox' 
              type="checkbox"
              checked={props.showColors}
              onChange={props.toggleShowColors}
            />
            <label>
              Enable colors
            </label>
          </div>
          <div id='rhythm' className='config-option'>
            <input
              id='rhythm-checkbox' 
              type="checkbox"
              checked={props.showRhythm}
              onChange={props.toggleShowRhythm}
            />
            <label>
              Enable rhythm
            </label>
          </div>
          <SetNumChords
            text='Number of columns'
            number={props.numColumns}
            increment={() => props.setNumColumns(props.numColumns + 1)}
            decrement={() => props.setNumColumns(props.numColumns - 1)}
          />
          <SetNumChords
            text='Number of rows'
            number={props.numRows}
            increment={() => props.setNumRows(props.numRows + 1)}
            decrement={() => props.setNumRows(props.numRows - 1)}
          />
        </div>
        <button
          id='export'
          onClick={props.downloadTab}
        >
          Export
        </button>
      </div>
    </div>
  );
}

export default Config;
