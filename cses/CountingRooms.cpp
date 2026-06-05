#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(int i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(int i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
int r,c;
vector<vector<bool>> vis;
vector<vector<char>> v;
int dx[4] = {-1,1,0,0};
int dy[4] = {0,0,-1,1};
void dfs(int x,int y){
    fo(i,4){
        int nx = x + dx[i];
        int ny = y + dy[i];
        if(!(nx >= 0 && ny >= 0 && nx < r && ny < c && v[nx][ny] == '.')) continue;
        if(!vis[nx][ny]){
            vis[nx][ny] = 1;
            dfs(nx,ny);
        }
    }
}
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    cin >> r >> c;
    v.resize(r,vector<char>(c));
    vis.assign(r,vector<bool>(c,0));
    fo(i,r){
        string s;
        cin >> s;
        fo(j,c){
            v[i][j] = s[j];
        }
    }
    int cnt = 0;
    fo(i,r){
        fo(j,c){
            if(v[i][j] == '.' && !vis[i][j]){
                cnt++;
                dfs(i,j);
            }
        }
    }   
    cout << cnt;
}   