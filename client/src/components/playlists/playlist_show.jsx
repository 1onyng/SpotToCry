import React from "react";
import { withRouter } from 'react-router-dom';
import PlaylistShowItem from "./playlist_show_item";
import { Query } from "react-apollo";
import { Mutation } from "react-apollo";
import Mutations from "../../graphql/mutations";
import Queries from "../../graphql/queries";
import gql from "graphql-tag";

const { DELETE_PLAYLIST } = Mutations;
const { FETCH_PLAYLIST } = Queries;
const { FETCH_PLAYLISTS } = Queries;

const PLAY_PLAYLIST_MUTATION = gql`
  mutation {
    playPlaylistMutation(id: $id) @client
  }
`;

class PlaylistShow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuVisible: false
    };

    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState(prevState => ({
      menuVisible: !prevState.menuVisible
    }));
  }

  updateCache(cache, { data }) {
    let playlists;
    try {
      playlists = cache.readQuery({ query: FETCH_PLAYLISTS });
    } catch (err) {
      return;
    }

    if (playlists) {
      let playlistArray = playlists.playlists;
      let newPlaylist = data.newPlaylist;
      cache.writeQuery({
        query: FETCH_PLAYLISTS,
        data: { playlists: playlistArray.concat(newPlaylist) }
      });
    }
  }

  render() {
    return (
      <Query
        query={FETCH_PLAYLIST}
        variables={{ id: this.props.match.params.playlistId }}
      >
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>{error}</p>;
          let playlistSongs;
          let songCount = data.playlist.songs.length;
          let { menuVisible } = this.state;
          let playlistArt;
          if (data.playlist.songs.length > 0) {
            playlistArt = <img src={data.playlist.songs[0].imageUrl}></img>;
          } else {
            playlistArt = (
              <img src="https://www.andrewwkmusic.com/wp-content/uploads/2014/05/No-album-art-itunes.jpg"></img>
            );
          }

          if (data.playlist.songs.length > 0) {
            playlistSongs = data.playlist.songs.map(song => {
              return (
                <PlaylistShowItem
                  key={song._id}
                  song={song}
                  playlistId={this.props.match.params.playlistId}
                />
              );
            });
          } else {
            playlistSongs = "";
          }

          return (
            <div className="playlist-show-c1">
              <div className="playlist-show-c2">
                <section id="album-show-section">
                  <div className="fluid-container">
                    <div className="fluid">
                      <div className="album-show-c3a">
                        <div className="album-show-c3a-content">
                          <div className="album-show-c3a-content-header">
                            <div className="cover-art-info">
                              <div className="cover-art-shadow">
                                <div>
                                  <div className="playlist-cover-container">
                                    <div className="playlist-coverArt-single">
                                      {playlistArt}
                                    </div>
                                  </div>
                                </div>
                                <button id="cover-art-play" />
                              </div>
                              <div className="album-title-container">
                                <span>{data.playlist.title}</span>
                              </div>
                              {/* todo: send current user down to associate with playlist */}
                              {/* <div className="album-artist">Demo User</div>  */}
                            </div>
                          </div>
                          {songCount > 0 && (
                            <Mutation mutation={PLAY_PLAYLIST_MUTATION}>
                              {playPlaylistMutation => (
                                <div
                                  className="album-show-left-play"
                                  onClick={() => {
                                    playPlaylistMutation({
                                      variables: {
                                        id: this.props.match.params.playlistId
                                      }
                                    });
                                  }}
                                >
                                  Play
                                </div>
                              )}
                            </Mutation>
                          )}
                          <div>
                            <div className="album-show-c3a-bottom">
                              <p>
                                {songCount ? songCount : 0}
                                {songCount != 1 ? " SONGS" : " SONG"}
                              </p>
                              <div
                                className="context-menu-ellipses"
                                title="More"
                                onClick={this.toggleMenu}
                              >
                                ...
                              </div>
                              <Mutation
                                mutation={DELETE_PLAYLIST}
                                update={(cache, data) =>
                                  this.updateCache(cache, data)
                                }
                              >
                                {deletePlaylist => (
                                  <div
                                    id="context-menu"
                                    className={
                                      menuVisible
                                        ? "context-menu-show"
                                        : "context-menu-hidden"
                                    }
                                    onClick={() => {
                                      deletePlaylist({
                                        variables: {
                                          id: this.props.match.params.playlistId
                                        }
                                      })
                                        .then(() =>
                                          this.props.history.push(
                                            "/library/playlists"
                                          )
                                        )
                                        .catch(err => {
                                          console.log(err);
                                        });
                                    }}
                                  >
                                    <div className="context-menu-item">
                                      Delete
                                    </div>
                                  </div>
                                )}
                              </Mutation>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="album-show-c3b">{playlistSongs}</div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default withRouter(PlaylistShow);
