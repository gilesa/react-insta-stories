import React from 'react'
import Story from './Story'
import ProgressArray from './ProgressArray'
import PropTypes from 'prop-types'

class Container extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      currentStoryGroup: 0,
      currentStoryItem: 0,
      pause: true,
      count: 0,
      storiesDone: 0
    }
    this.defaultInterval = props.defaultInterval
    this.width = props.width
    this.height = props.height
  }

  pause = (action, bufferAction) => {
    this.setState({ pause: action === 'pause', bufferAction })
  }

  previous = () => {
    if (this.state.currentStoryItem > 0) {
      this.setState({
        currentStoryItem: this.state.currentStoryItem - 1,
        count: 0
      })
    } else if (this.state.currentStoryGroup > 0) {
      this.setState({
        currentStoryGroup: this.state.currentStoryGroup - 1,
        count: 0
      })
    }
  }

  next = () => {
    if (this.state.currentStoryItem < this.props.stories[this.state.currentStoryGroup].items.length - 1) {
      this.setState({
        currentStoryItem: this.state.currentStoryItem + 1,
        count: 0
      })
    } else if (this.props.loop) {
      this.updateNextStoryGroupForLoop()
    } else {
      this.updateNextStoryGroup()
    }
  };

  updateNextStoryGroupForLoop = () => {
    this.setState({
      currentStoryGroup: (this.state.currentStoryGroup + 1) % this.props.stories.length,
      count: 0
    })
  }

  updateNextStoryGroup = () => {
    if (this.state.currentStoryGroup < this.props.stories.length - 1) {
      this.setState({
        currentStoryGroup: this.state.currentStoryGroup + 1,
        count: 0
      })
    }
  }

  debouncePause = (e) => {
    e.preventDefault()
    this.mousedownId = setTimeout(() => {
      this.pause('pause')
    }, 200)
  }

  mouseUp = (e, type) => {
    e.preventDefault()
    this.mousedownId && clearTimeout(this.mousedownId)
    if (this.state.pause) {
      this.pause('play')
    } else {
      type === 'next' ? this.next() : this.previous()
    }
  }

  getVideoDuration = duration => {
    this.setState({ videoDuration: duration })
  }

  toggleMore = show => {
    if (this.story) {
      this.story.toggleMore(show)
      return true
    } else return false
  }

  render() {
    return (
      <div style={{ ...styles.container, ...{ width: this.width, height: this.height } }}>
        <ProgressArray
          next={this.next}
          pause={this.state.pause}
          bufferAction={this.state.bufferAction}
          videoDuration={this.state.videoDuration}
          length={this.props.stories[this.state.currentStoryGroup].items.map((_, i) => i)}
          defaultInterval={this.defaultInterval}
          currentStory={this.props.stories[this.state.currentStoryGroup].items[this.state.currentStoryItem]}
          progress={{ id: this.state.currentStoryItem, completed: this.state.count / ((this.props.stories[this.state.currentStoryGroup].items[this.currentStoryItem] && this.props.stories[this.state.currentStoryGroup].items[this.currentStoryItem].duration) || this.defaultInterval) }}
        />
        <Story
          ref={s => this.story = s}
          action={this.pause}
          bufferAction={this.state.bufferAction}
          height={this.height}
          playState={this.state.pause}
          width={this.width}
          story={this.props.stories[this.state.currentStoryGroup].items[this.currentStoryItem]}
          loader={this.props.loader}
          header={this.props.header}
          headerContent={this.props.stories[this.state.currentStoryGroup].headerContent}
          getVideoDuration={this.getVideoDuration}
          storyContentStyles={this.props.storyContentStyles}
        />
        <div style={styles.overlay}>
          <div style={{ width: '50%', zIndex: 999 }} onTouchStart={this.debouncePause} onTouchEnd={e => this.mouseUp(e, 'previous')} onMouseDown={this.debouncePause} onMouseUp={(e) => this.mouseUp(e, 'previous')} />
          <div style={{ width: '50%', zIndex: 999 }} onTouchStart={this.debouncePause} onTouchEnd={e => this.mouseUp(e, 'next')} onMouseDown={this.debouncePause} onMouseUp={(e) => this.mouseUp(e, 'next')} />
        </div>
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    background: '#111',
    position: 'relative'
  },
  overlay: {
    position: 'absolute',
    height: 'inherit',
    width: 'inherit',
    display: 'flex'
  },
  left: {
  },
  right: {
  }
}

Container.propTypes = {
  stories: PropTypes.array,
  defaultInterval: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  loader: PropTypes.element,
  header: PropTypes.element,
  storyContentStyles: PropTypes.object,
  loop: PropTypes.bool
}

Container.defaultProps = {
  defaultInterval: 4000,
  width: 360,
  height: 640
}

export default Container
