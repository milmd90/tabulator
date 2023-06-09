import React, {useState} from 'react';
import {
  TabColumn,
  TabStringData,
  tabStrings,
  generateTabs,
  isValidTab
} from '../../../helpers/tabs';
import { IChordParams } from './Chord';
import TabDetail from './TabDetail';

function Cell(props: {
  data: TabStringData
  showColors: boolean
}): any {
  const {tone, fret} = props.data;
  const className = tone === 'X' || !props.showColors ? '' : `tone-${tone}`;

  return (
    <div className={`fret-number ${className}`}>
      {fret}
    </div>
  )
}

function Display(props: {
  data: IChordParams,
  showColors: boolean,
  onChange: (data: TabColumn) => void
}) {
  const tab = generateTabs(props.data);
  props.onChange(tab);
  const isValid = isValidTab(tab);
  const [showDetail, setShowDetail] = useState(false);

  const setDetailPosition = (e: any) => {
    const details = Array.from(document.getElementsByClassName('tab-detail') as HTMLCollectionOf<HTMLElement>)
    details.forEach((detail) => {
      detail.style.left = e.pageX + 20 + 'px';
      detail.style.top = e.pageY + 20 + 'px';
    });
  }

  document.addEventListener('mousemove', setDetailPosition);

  return (
    <div className="display">
      <div
        className="tab-row"
        onMouseOver={(e) => {
          setShowDetail(true);
          setDetailPosition(e);
        }}
        onMouseOut={() => setShowDetail(false)}
      >
        {tabStrings.map((tabString) => 
          <Cell 
            key={tabString} 
            showColors={props.showColors}
            data={tab[tabString]} 
          />
        )}
      </div>
      {isValid && <TabDetail 
        tab={tab}
        hide={!showDetail}
      />}
    </div>
  );
}

export default Display;
