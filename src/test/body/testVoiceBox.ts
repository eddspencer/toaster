/// <reference path="../../../typings/mocha/mocha.d.ts" />
/// <reference path="../../../typings/chai/chai.d.ts" />
import { expect } from 'chai'
import { ArrayLogger, DefaultVoiceBox, Level } from '../../main/body/voicebox'

describe('VoiceBox', () => {
  const logger = new ArrayLogger();
  const voiceBox = new DefaultVoiceBox(Level.Silence, logger)

  beforeEach(() => {
    voiceBox.level = Level.Silence
    logger.messages = []
  })

  function testLevel(level: Level, fun: (string) => void) {
    fun("Ignored")
    voiceBox.level = level
    fun("Testing")
    fun("Things")
    expect(logger.messages).to.deep.equal(["Testing", "Things"])
  }

  it('should add info messages', () => {
    testLevel(Level.Info, (txt) => voiceBox.info(txt))
  })

  it('should add warn messages', () => {
    testLevel(Level.Warn, (txt) => voiceBox.warn(txt))
  })

  it('should add error messages', () => {
    testLevel(Level.Error, (txt) => voiceBox.error(txt))
  })

  it('should add debug messages', () => {
    testLevel(Level.Debug, (txt) => voiceBox.debug(txt))
  })
})